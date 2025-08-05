
export interface RequestOptions {
  priority?: 'high' | 'medium' | 'low';
  retries?: number;
  timeout?: number;
  deduplicationKey?: string;
}

export interface QueuedRequest {
  id: string;
  url: string;
  config: any;
  options: RequestOptions;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  retryCount: number;
}

export interface RequestManagerStatus {
  activeRequests: number;
  queuedRequests: number;
  isRateLimited: boolean;
  rateLimitResetTime?: number;
  averageResponseTime: number;
  successRate: number;
  circuitBreakerTrips: number;
}


enum CircuitState {
  CLOSED = 'CLOSED',     
  OPEN = 'OPEN',         
  HALF_OPEN = 'HALF_OPEN' 
}

interface CircuitBreakerConfig {
  failureThreshold: number;   
  recoveryTimeout: number;    
  successThreshold: number;   
  monitoringWindow: number;   
}

class RequestManager {
  private queue: QueuedRequest[] = [];
  private activeRequests = new Map<string, Promise<any>>();
  private inFlightRequests = new Set<string>();
  private rateLimitInfo = {
    isLimited: false,
    resetTime: 0,
    retryAfter: 0,
    remaining: 100,
    limit: 100
  };
  
  private circuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private successCount = 0;
  private circuitOpenTime = 0;
  
  private readonly circuitConfig: CircuitBreakerConfig = {
    failureThreshold: 5,       
    recoveryTimeout: 30000,     
    successThreshold: 3,        
    monitoringWindow: 60000     
  };
  
  private requestStats = {
    total: 0,
    successful: 0,
    failed: 0,
    totalResponseTime: 0,
    circuitBreakerTrips: 0
  };
  

  private readonly MAX_CONCURRENT = 8;
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY = 1000;
  private readonly MAX_DELAY = 30000;
  private readonly JITTER_FACTOR = 0.1;


  async enqueue(url: string, config: any, options: RequestOptions = {}): Promise<any> {
    const deduplicationKey = options.deduplicationKey || `${config.method || 'GET'}:${url}`;
    
    if (this.activeRequests.has(deduplicationKey)) {
      return this.activeRequests.get(deduplicationKey);
    }

    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        config,
        options: {
          priority: 'medium',
          retries: this.MAX_RETRIES,
          timeout: 30000,
          ...options
        },
        resolve,
        reject,
        timestamp: Date.now(),
        retryCount: 0
      };


      this.insertByPriority(request);
      this.processQueue();
    });
  }


  private insertByPriority(request: QueuedRequest) {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const requestPriority = priorityOrder[request.options.priority!];
    
    let insertIndex = this.queue.length;
    for (let i = 0; i < this.queue.length; i++) {
      const queuePriority = priorityOrder[this.queue[i].options.priority!];
      if (requestPriority < queuePriority) {
        insertIndex = i;
        break;
      }
    }
    
    this.queue.splice(insertIndex, 0, request);
  }


  private checkCircuitBreaker(): void {
    const now = Date.now();
    
    
    if (now - this.lastFailureTime > this.circuitConfig.monitoringWindow) {
      this.failureCount = 0;
    }
    
    
    if (this.circuitState === CircuitState.CLOSED && 
        this.failureCount >= this.circuitConfig.failureThreshold) {
      this.circuitState = CircuitState.OPEN;
      this.circuitOpenTime = now;
      this.requestStats.circuitBreakerTrips++;
      console.warn(`Circuit breaker OPENED after ${this.failureCount} failures`);
    }
    
    
    if (this.circuitState === CircuitState.OPEN && 
        now - this.circuitOpenTime > this.circuitConfig.recoveryTimeout) {
      this.circuitState = CircuitState.HALF_OPEN;
      this.successCount = 0;
      console.info('Circuit breaker HALF-OPEN - testing recovery');
    }
  }
  

  private recordRequestResult(success: boolean): void {
    const now = Date.now();
    
    if (success) {
      if (this.circuitState === CircuitState.HALF_OPEN) {
        this.successCount++;
        if (this.successCount >= this.circuitConfig.successThreshold) {
          this.circuitState = CircuitState.CLOSED;
          this.failureCount = 0;
          console.info('Circuit breaker CLOSED - service recovered');
        }
      } else if (this.circuitState === CircuitState.CLOSED) {
        
        this.failureCount = Math.max(0, this.failureCount - 1);
      }
    } else {
      this.failureCount++;
      this.lastFailureTime = now;
      
      if (this.circuitState === CircuitState.HALF_OPEN) {
        
        this.circuitState = CircuitState.OPEN;
        this.circuitOpenTime = now;
        console.warn('Circuit breaker back to OPEN - recovery failed');
      }
    }
    
    this.checkCircuitBreaker();
  }
  

  private isRequestAllowed(): boolean {
    this.checkCircuitBreaker();
    
    if (this.circuitState === CircuitState.OPEN) {
      return false; 
    }
    
    if (this.circuitState === CircuitState.HALF_OPEN) {
      return this.inFlightRequests.size < 2;
    }
    
    return true; 
  }


  private async processQueue() {
    if (this.rateLimitInfo.isLimited) {
      const now = Date.now();
      if (now < this.rateLimitInfo.resetTime) {
        setTimeout(() => this.processQueue(), this.rateLimitInfo.resetTime - now);
        return;
      } else {
        this.rateLimitInfo.isLimited = false;
      }
    }

    while (this.queue.length > 0 && this.inFlightRequests.size < this.MAX_CONCURRENT) {
      const request = this.queue.shift()!;
      this.executeRequest(request);
    }
  }


  private async executeRequest(request: QueuedRequest) {
    const { id, url, config, options, resolve, reject } = request;
    const deduplicationKey = options.deduplicationKey || `${config.method || 'GET'}:${url}`;
    
    if (!this.isRequestAllowed()) {
      const error = new Error('Circuit breaker is OPEN - service temporarily unavailable');
      (error as any).code = 'CIRCUIT_BREAKER_OPEN';
      (error as any).retryAfter = Math.ceil(this.circuitConfig.recoveryTimeout / 1000);
      reject(error);
      return;
    }
    
    this.inFlightRequests.add(id);
    const startTime = Date.now();

    try {
      const axios = (await import('axios')).default;
      
      const requestPromise = axios({
        url,
        timeout: options.timeout,
        ...config
      });

      this.activeRequests.set(deduplicationKey, requestPromise);
      
      const response = await requestPromise;
      
      this.requestStats.total++;
      this.requestStats.successful++;
      this.requestStats.totalResponseTime += Date.now() - startTime;
      
      this.recordRequestResult(true);
      
      this.activeRequests.delete(deduplicationKey);
      this.inFlightRequests.delete(id);
      
      resolve(response);
      this.processQueue();
      
    } catch (error: any) {
      this.inFlightRequests.delete(id);
      this.activeRequests.delete(deduplicationKey);
      
      this.requestStats.total++;
      this.requestStats.failed++;
      
      this.recordRequestResult(false);
      
      if (error.response?.status === 429) {
        this.handleRateLimit(error.response);
        
        if (request.retryCount < (options.retries || this.MAX_RETRIES)) {
          request.retryCount++;
          const delay = this.calculateBackoffDelay(request.retryCount);
          setTimeout(() => {
            this.queue.unshift(request);
            this.processQueue();
          }, delay);
          return;
        }
      }
      
      if (this.isRetryableError(error) && request.retryCount < (options.retries || this.MAX_RETRIES)) {
        request.retryCount++;
        const delay = this.calculateBackoffDelay(request.retryCount);
        setTimeout(() => {
          this.queue.unshift(request);
          this.processQueue();
        }, delay);
        return;
      }
      
      this.requestStats.total++;
      this.requestStats.failed++;
      
      reject(error);
      this.processQueue();
    }
  }


  private handleRateLimit(response: any) {
    console.warn('Rate limit hit - implementing recovery strategy');
    
    const headers = response.headers;
    this.rateLimitInfo.remaining = 0;
    
    
    let retryAfterMs = 60000; 
    
    if (headers['retry-after']) {
      const retryAfter = headers['retry-after'];
      
      if (isNaN(retryAfter)) {
        retryAfterMs = new Date(retryAfter).getTime() - Date.now();
      } else {
        retryAfterMs = parseInt(retryAfter) * 1000;
      }
    } else if (headers['ratelimit-reset'] || headers['x-ratelimit-reset']) {
      const resetHeader = headers['ratelimit-reset'] || headers['x-ratelimit-reset'];
      const resetTime = resetHeader.includes('T') 
        ? new Date(resetHeader).getTime()
        : parseInt(resetHeader) * 1000;
      retryAfterMs = Math.max(0, resetTime - Date.now());
    }
    
    
    retryAfterMs = Math.max(5000, Math.min(retryAfterMs, 300000)); 
    
    this.rateLimitInfo.resetTime = Date.now() + retryAfterMs;
    this.rateLimitInfo.retryAfter = retryAfterMs;
    this.rateLimitInfo.isLimited = true;
    
    
    this.circuitConfig.recoveryTimeout = Math.max(
      this.circuitConfig.recoveryTimeout,
      retryAfterMs
    );
    
    console.info(`Rate limit recovery scheduled in ${Math.ceil(retryAfterMs / 1000)}s`);
    
    
    setTimeout(() => {
      console.info('Rate limit window expired - resuming normal operation');
      this.rateLimitInfo.isLimited = false;
      this.rateLimitInfo.remaining = this.rateLimitInfo.limit || 100;
    }, retryAfterMs);
  }

  private calculateBackoffDelay(retryCount: number): number {
    const exponentialDelay = Math.min(
      this.BASE_DELAY * Math.pow(2, retryCount - 1),
      this.MAX_DELAY
    );
    
    const jitter = exponentialDelay * this.JITTER_FACTOR * Math.random();
    return exponentialDelay + jitter;
  }

 
  private isRetryableError(error: any): boolean {
    if (!error.response) return true; 
    
    const status = error.response.status;
    return status >= 500 || status === 429 || status === 408;
  }


  getStatus(): RequestManagerStatus {
    const successRate = this.requestStats.total > 0 
      ? (this.requestStats.successful / this.requestStats.total) * 100 
      : 100;
    
    const averageResponseTime = this.requestStats.successful > 0
      ? this.requestStats.totalResponseTime / this.requestStats.successful
      : 0;

    return {
      activeRequests: this.inFlightRequests.size,
      queuedRequests: this.queue.length,
      isRateLimited: this.rateLimitInfo.isLimited,
      rateLimitResetTime: this.rateLimitInfo.resetTime,
      averageResponseTime,
      successRate,
      circuitBreakerTrips: this.requestStats.circuitBreakerTrips
    };
  }


  clear() {
    this.queue.forEach(request => {
      request.reject(new Error('Request cancelled'));
    });
    this.queue = [];
    this.activeRequests.clear();
  }
}


export const requestManager = new RequestManager();
