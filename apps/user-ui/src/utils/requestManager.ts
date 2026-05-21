interface RequestConfig {
  url: string;
  method?: string;
  data?: any;
  headers?: Record<string, string>;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  retryable?: boolean;
  maxRetries?: number;
  timeout?: number;
}

interface QueuedRequest {
  id: string;
  config: RequestConfig;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  retryCount: number;
  priority: number;
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
  private static instance: RequestManager;
  private pendingRequests = new Map<string, Promise<any>>();
  private requestQueue: QueuedRequest[] = [];
  private activeRequests = new Set<string>();
  private rateLimitInfo = {
    remaining: 100,
    resetTime: Date.now() + 60000,
    windowMs: 60000,
    limit: 100,
    retryAfter: 0
  };
  private requestHistory: { timestamp: number; success: boolean }[] = [];
  private backoffMultiplier = 1;
  private lastBackoffReset = Date.now();


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


  private readonly MAX_CONCURRENT = 6;
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY = 1000;
  private readonly MAX_DELAY = 30000;
  private readonly JITTER_FACTOR = 0.1;

  static getInstance(): RequestManager {
    if (!RequestManager.instance) {
      RequestManager.instance = new RequestManager();
    }
    return RequestManager.instance;
  }

  private constructor() {
    setInterval(() => {
      const recentRequests = this.requestHistory.filter(
        req => Date.now() - req.timestamp < 300000 
      );
      const successRate = recentRequests.length > 0 
        ? recentRequests.filter(req => req.success).length / recentRequests.length 
        : 1;

      if (successRate > 0.9 && Date.now() - this.lastBackoffReset > 300000) {
        this.backoffMultiplier = Math.max(1, this.backoffMultiplier * 0.5);
        this.lastBackoffReset = Date.now();
      }
    }, 60000);


    setInterval(() => this.processQueue(), 100);
  }


  private generateRequestKey(config: RequestConfig): string {
    const { url, method = 'GET', data } = config;
    const dataHash = data ? JSON.stringify(data) : '';
    return `${method}:${url}:${dataHash}`;
  }


  private getPriorityScore(priority: string): number {
    const scores = { critical: 4, high: 3, medium: 2, low: 1 };
    return scores[priority as keyof typeof scores] || 2;
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
      return this.activeRequests.size < 2;
    }
    
    return true; 
  }


  private shouldThrottle(): boolean {
    const now = Date.now();
    
    if (!this.isRequestAllowed()) {
      return true;
    }
    
    if (now > this.rateLimitInfo.resetTime) {
      this.rateLimitInfo.remaining = 100;
      this.rateLimitInfo.resetTime = now + this.rateLimitInfo.windowMs;
    }


    const recentRequests = this.requestHistory.filter(
      req => now - req.timestamp < 60000
    );
    const errorRate = recentRequests.length > 5 
      ? recentRequests.filter(req => !req.success).length / recentRequests.length 
      : 0;

    return (
      this.activeRequests.size >= this.MAX_CONCURRENT ||
      this.rateLimitInfo.remaining <= 5 ||
      errorRate > 0.5 ||
      this.backoffMultiplier > 4
    );
  }


  private calculateBackoffDelay(retryCount: number): number {
    const jitter = Math.random() * this.JITTER_FACTOR; 
    
    const delay = Math.min(
      this.BASE_DELAY * Math.pow(2, retryCount) * this.backoffMultiplier * (1 + jitter),
      this.MAX_DELAY
    );
    
    return delay;
  }


  private async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0 || this.shouldThrottle()) {
      return;
    }


    this.requestQueue.sort((a, b) => {
      if (a.priority !== b.priority) {
        return b.priority - a.priority; 
      }
      return a.timestamp - b.timestamp; 
    });

    const request = this.requestQueue.shift();
    if (!request) return;

    await this.executeRequest(request);
  }


  private async executeRequest(request: QueuedRequest): Promise<void> {
    const { id, config, resolve, reject } = request;
    const startTime = Date.now();
    
    if (!this.isRequestAllowed()) {
      const error = new Error('Circuit breaker is OPEN - service temporarily unavailable');
      (error as any).code = 'CIRCUIT_BREAKER_OPEN';
      (error as any).retryAfter = Math.ceil(this.circuitConfig.recoveryTimeout / 1000);
      reject(error);
      return;
    }
    
    try {
      this.activeRequests.add(id);
      this.requestStats.total++;
      
      const axiosInstance = (await import('./axiosInstance')).default;
      
      const response = await axiosInstance({
        url: config.url,
        method: config.method || 'GET',
        data: config.data,
        headers: config.headers,
        timeout: config.timeout || 10000,
      });

      this.updateRateLimitInfo(response.headers);
      
      const responseTime = Date.now() - startTime;
      this.requestHistory.push({ timestamp: Date.now(), success: true });
      this.requestHistory = this.requestHistory.slice(-100); 
      
      this.recordRequestResult(true);
      this.requestStats.successful++;
      this.requestStats.totalResponseTime += responseTime;

      resolve(response);
    } catch (error: any) {
      this.requestHistory.push({ timestamp: Date.now(), success: false });
      this.requestHistory = this.requestHistory.slice(-100);
      
      this.recordRequestResult(false);
      this.requestStats.failed++;

      if (error.response?.status === 429) {
        this.handleRateLimit(error.response.headers);
        
        if (config.retryable !== false && request.retryCount < (config.maxRetries || this.MAX_RETRIES)) {
          const delay = this.calculateBackoffDelay(request.retryCount);
          
          setTimeout(() => {
            this.requestQueue.unshift({
              ...request,
              retryCount: request.retryCount + 1,
              timestamp: Date.now() + delay
            });
          }, delay);
          
          return;
        }
      }

      reject(error);
    } finally {
      this.activeRequests.delete(id);
      this.pendingRequests.delete(this.generateRequestKey(config));
    }
  }


  private updateRateLimitInfo(headers: any): void {
    if (headers['ratelimit-remaining'] || headers['x-ratelimit-remaining']) {
      this.rateLimitInfo.remaining = parseInt(
        headers['ratelimit-remaining'] || headers['x-ratelimit-remaining']
      );
    }
    
    if (headers['ratelimit-reset'] || headers['x-ratelimit-reset']) {
      const resetHeader = headers['ratelimit-reset'] || headers['x-ratelimit-reset'];
      this.rateLimitInfo.resetTime = resetHeader.includes('T') 
        ? new Date(resetHeader).getTime()
        : parseInt(resetHeader) * 1000;
    }
    
    if (headers['ratelimit-limit'] || headers['x-ratelimit-limit']) {
      this.rateLimitInfo.limit = parseInt(
        headers['ratelimit-limit'] || headers['x-ratelimit-limit']
      );
    }
  }


  private handleRateLimit(headers: any): void {
    console.warn('Rate limit hit - implementing recovery strategy');
    
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
    
    this.circuitConfig.recoveryTimeout = Math.max(
      this.circuitConfig.recoveryTimeout,
      retryAfterMs
    );
    
    
    this.backoffMultiplier = Math.min(this.backoffMultiplier * 1.5, 4);
    
    console.info(`Rate limit recovery scheduled in ${Math.ceil(retryAfterMs / 1000)}s`);
    
    setTimeout(() => {
      console.info('Rate limit window expired - resuming normal operation');
      this.rateLimitInfo.remaining = this.rateLimitInfo.limit || 100;
      this.backoffMultiplier = Math.max(1, this.backoffMultiplier * 0.8);
    }, retryAfterMs);
  }


  async request(config: RequestConfig): Promise<any> {
    const requestKey = this.generateRequestKey(config);
    
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    const promise = new Promise((resolve, reject) => {
      const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const priority = this.getPriorityScore(config.priority || 'medium');
      
      const queuedRequest: QueuedRequest = {
        id: requestId,
        config,
        resolve,
        reject,
        timestamp: Date.now(),
        retryCount: 0,
        priority
      };

      if (this.shouldThrottle()) {
        this.requestQueue.push(queuedRequest);
      } else {
        this.executeRequest(queuedRequest);
      }
    });

    this.pendingRequests.set(requestKey, promise);
    return promise;
  }


  getStatus() {
    const now = Date.now();
    const recentRequests = this.requestHistory.filter(
      req => now - req.timestamp < 60000
    );
    
    const avgResponseTime = this.requestStats.successful > 0 
      ? this.requestStats.totalResponseTime / this.requestStats.successful 
      : 0;
    
    return {
      activeRequests: this.activeRequests.size,
      queuedRequests: this.requestQueue.length,
      maxConcurrentRequests: this.MAX_CONCURRENT,
      
      rateLimitRemaining: this.rateLimitInfo.remaining,
      rateLimitResetIn: Math.max(0, this.rateLimitInfo.resetTime - now),
      backoffMultiplier: this.backoffMultiplier,
      
      circuitState: this.circuitState,
      circuitFailureCount: this.failureCount,
      circuitSuccessCount: this.successCount,
      circuitBreakerTrips: this.requestStats.circuitBreakerTrips,
      circuitRecoveryTimeRemaining: this.circuitState === CircuitState.OPEN 
        ? Math.max(0, (this.circuitOpenTime + this.circuitConfig.recoveryTimeout) - now)
        : 0,
      
      totalRequests: this.requestStats.total,
      successfulRequests: this.requestStats.successful,
      failedRequests: this.requestStats.failed,
      successRate: this.requestStats.total > 0 
        ? this.requestStats.successful / this.requestStats.total 
        : 1,
      averageResponseTime: Math.round(avgResponseTime),
      
      recentSuccessRate: recentRequests.length > 0 
        ? recentRequests.filter(req => req.success).length / recentRequests.length 
        : 1,
      recentRequestCount: recentRequests.length,
      
      healthStatus: this.getHealthStatus()
    };
  }
  
  private getHealthStatus(): 'healthy' | 'degraded' | 'critical' | 'circuit_open' {
    if (this.circuitState === CircuitState.OPEN) {
      return 'circuit_open';
    }
    
    const successRate = this.requestStats.total > 0 
      ? this.requestStats.successful / this.requestStats.total 
      : 1;
    
    if (successRate >= 0.95 && this.backoffMultiplier <= 2) {
      return 'healthy';
    } else if (successRate >= 0.8 && this.backoffMultiplier <= 4) {
      return 'degraded';
    } else {
      return 'critical';
    }
  }
}

export default RequestManager.getInstance();
