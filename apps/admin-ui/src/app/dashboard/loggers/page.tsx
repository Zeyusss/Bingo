'use client';
import React, { useEffect, useState, useRef, useMemo } from "react";
import { Download, Filter, Search, Play, Pause, Trash2, AlertCircle, CheckCircle, AlertTriangle, Info, Bug } from "lucide-react";
import { Button } from "../../shared/components/ui/button";
import HelpModal, { HelpSection } from "../../shared/components/HelpModal";
import HelpButton from "../../shared/components/HelpButton";

type LogLevel = "success" | "error" | "warning" | "info" | "debug";

interface LogMessage {
  type: LogLevel;
  message: string;
  timestamp: string;
  source: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface LogBatch {
  type: 'log_batch';
  logType: LogLevel;
  logs: LogMessage[];
  timestamp: string;
  count: number;
}

const LOG_LEVEL_CONFIG = {
  error: { color: "text-red-400", bgColor: "bg-red-500/10", icon: AlertCircle, priority: 1 },
  warning: { color: "text-yellow-400", bgColor: "bg-yellow-500/10", icon: AlertTriangle, priority: 2 },
  info: { color: "text-blue-400", bgColor: "bg-blue-500/10", icon: Info, priority: 3 },
  success: { color: "text-green-400", bgColor: "bg-green-500/10", icon: CheckCircle, priority: 4 },
  debug: { color: "text-gray-400", bgColor: "bg-gray-500/10", icon: Bug, priority: 5 },
} as const;

const LogViewer = () => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevels, setSelectedLevels] = useState<Set<LogLevel>>(new Set(["error", "warning", "info", "success", "debug"]));
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | 'all'>('1h');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const helpSections: HelpSection[] = [
    {
      title: "Overview",
      content: "This centralized logging system captures, processes, and displays real-time logs from all backend services in one unified interface. It helps you monitor application health, debug issues, track user activities, and analyze system performance.",
      subsections: [
        {
          title: "Real-Time Monitoring",
          content: "Watch logs stream live as users interact with your application"
        },
        {
          title: "Debugging Power", 
          content: "Trace issues across services with request correlation"
        },
        {
          title: "Performance Insights",
          content: "Monitor response times, errors, and system bottlenecks"
        },
        {
          title: "Security Auditing",
          content: "Track authentication events and suspicious activities"
        }
      ]
    },
    {
      title: "Log Levels",
      content: "Understanding different log severity levels:",
      subsections: [
        {
          title: "ERROR",
          content: "Critical issues that need immediate attention (failed requests, database errors, crashes)"
        },
        {
          title: "WARNING",
          content: "Potential issues or unusual conditions (slow responses, deprecated API usage)"
        },
        {
          title: "INFO",
          content: "General application events (user logins, API calls, business operations)"
        },
        {
          title: "SUCCESS",
          content: "Successful operations and positive outcomes (completed transactions, successful authentications)"
        },
        {
          title: "DEBUG",
          content: "Detailed technical information for development and troubleshooting"
        }
      ]
    },
    {
      title: "Using Filters",
      content: "Effective filtering strategies:",
      subsections: [
        {
          title: "Source Filter",
          content: "Filter by service: auth-service (authentication), product-service (products), order-service (orders), admin-service (admin operations)"
        },
        {
          title: "Level Filter",
          content: "Focus on specific types: Errors only for troubleshooting, Info + Success for normal operations, All levels for complete visibility"
        },
        {
          title: "Time Range",
          content: "Control log history: 1h (recent activity), 6h (extended monitoring), 24h (daily overview), All (complete history)"
        }
      ]
    },
    {
      title: "Best Practices",
      content: "Tips for effective log analysis:",
      subsections: [
        {
          title: "Request Correlation",
          content: "Use req:abc123 to trace a single request across services. Find the request ID in any log entry, search for that ID to see the complete journey, track performance from start to finish."
        },
        {
          title: "User Tracking",
          content: "Use user:xyz789 to follow a specific user's activity. See all actions by a particular user, debug user-specific issues, analyze user behavior patterns."
        },
        {
          title: "Debugging Workflow",
          content: "1. Start with Errors: Filter by ERROR level to identify critical issues. 2. Find the Request: Look for the request ID in error logs. 3. Trace the Journey: Search for that request ID to see the full flow. 4. Check Related Services: Filter by different sources to see cross-service impact. 5. Analyze Metadata: Examine the JSON metadata for detailed context."
        }
      ]
    },
    {
      title: "Controls",
      content: "Available actions and controls:",
      subsections: [
        {
          title: "Playback Controls",
          content: "Pause logging during investigation, Clear logs to start fresh monitoring, Use auto-scroll for live monitoring, Disable auto-scroll to examine specific logs"
        },
        {
          title: "Export & Analysis",
          content: "Use Export button for offline analysis, Filter before exporting to reduce file size, Share logs with team members, Archive important debugging sessions"
        }
      ]
    }
  ];
  
  const logContainerRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const pendingLogsRef = useRef<LogMessage[]>([]);

  const availableSources = useMemo(() => {
    const sources = new Set(logs.map(log => log.source));
    return Array.from(sources).sort();
  }, [logs]);

  const filteredLogs = useMemo(() => {
    let filtered = logs;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(term) ||
        log.source.toLowerCase().includes(term) ||
        (log.requestId && log.requestId.toLowerCase().includes(term)) ||
        (log.userId && log.userId.toLowerCase().includes(term))
      );
    }


    filtered = filtered.filter(log => selectedLevels.has(log.type));


    if (selectedSources.size > 0) {
      filtered = filtered.filter(log => selectedSources.has(log.source));
    }

    if (timeRange !== 'all') {
      const now = new Date();
      const cutoff = new Date(now.getTime() - (timeRange === '1h' ? 3600000 : timeRange === '6h' ? 21600000 : 86400000));
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoff);
    }


    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, searchTerm, selectedLevels, selectedSources, timeRange]);

  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const socket = new WebSocket(process.env.NEXT_PUBLIC_SOCKET_URI!);
        socketRef.current = socket;

        socket.onopen = () => {
          setIsConnected(true);
          console.log('[LogViewer] Connected to log stream');
        };

        socket.onmessage = (event) => {
          if (isPaused) {
            return; 
          }

          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'log_batch') {
              const batch = data as LogBatch;
              pendingLogsRef.current.push(...batch.logs);
            } else {
              const logMessage = data as LogMessage;
              if (isValidLogMessage(logMessage)) {
                pendingLogsRef.current.push(logMessage);
              }
            }
          } catch (error) {
            console.error('[LogViewer] Invalid log format:', error);
          }
        };

        socket.onclose = () => {
          setIsConnected(false);
          console.log('[LogViewer] Disconnected from log stream');

          setTimeout(connectWebSocket, 3000);
        };

        socket.onerror = (error) => {
          console.error('[LogViewer] WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('[LogViewer] Failed to connect:', error);
        setIsConnected(false);
        setTimeout(connectWebSocket, 5000);
      }
    };

    connectWebSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [isPaused]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingLogsRef.current.length > 0) {
        setLogs(prev => {
          const newLogs = [...prev, ...pendingLogsRef.current];
          pendingLogsRef.current = [];
          
          return newLogs.slice(-5000);
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

 
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [filteredLogs, autoScroll]);

  const isValidLogMessage = (data: any): data is LogMessage => {
    return (
      data &&
      typeof data.type === 'string' &&
      typeof data.message === 'string' &&
      typeof data.timestamp === 'string' &&
      typeof data.source === 'string' &&
      ['info', 'error', 'warning', 'success', 'debug'].includes(data.type)
    );
  };

  const toggleLogLevel = (level: LogLevel) => {
    setSelectedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const toggleSource = (source: string) => {
    setSelectedSources(prev => {
      const newSet = new Set(prev);
      if (newSet.has(source)) {
        newSet.delete(source);
      } else {
        newSet.add(source);
      }
      return newSet;
    });
  };

  const downloadLogs = () => {
    const content = filteredLogs.map(log => {
      const timestamp = new Date(log.timestamp).toISOString();
      const metadata = log.metadata ? ` | ${JSON.stringify(log.metadata)}` : '';
      const requestId = log.requestId ? ` | RequestID: ${log.requestId}` : '';
      const userId = log.userId ? ` | UserID: ${log.userId}` : '';
      return `[${timestamp}] ${log.source} [${log.type.toUpperCase()}] ${log.message}${requestId}${userId}${metadata}`;
    }).join("\n");

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `application-logs-${new Date().toISOString().split('T')[0]}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    setLogs([]);
    pendingLogsRef.current = [];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold text-gray-900">Application Logs</h1>
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              {isConnected ? 'Connected' : 'Disconnected'}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={isPaused ? "default" : "outline"}
              size="sm"
              onClick={() => setIsPaused(!isPaused)}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearLogs}
            >
              <Trash2 size={16} />
              Clear
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={downloadLogs}
            >
              <Download size={16} />
              Export ({filteredLogs.length})
            </Button>
            
            <HelpButton
              onClick={() => setShowInfoModal(true)}
              text="How Logging Works"
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex items-center gap-2 min-w-[300px]">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Log Level Filters */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-sm text-gray-600">Levels:</span>
            {Object.entries(LOG_LEVEL_CONFIG).map(([level, config]) => {
              const Icon = config.icon;
              const isSelected = selectedLevels.has(level as LogLevel);
              return (
                <button
                  key={level}
                  onClick={() => toggleLogLevel(level as LogLevel)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isSelected
                      ? `${config.color} ${config.bgColor}`
                      : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={12} />
                  {level}
                </button>
              );
            })}
          </div>

          {/* Time Range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Time:</span>
            {['1h', '6h', '24h', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-100 text-blue-800'
                    : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {range === 'all' ? 'All' : range.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Auto-scroll toggle */}
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded"
            />
            Auto-scroll
          </label>
        </div>

        {/* Source Filters */}
        {availableSources.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-600">Sources:</span>
            <button
              onClick={() => setSelectedSources(new Set())}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Clear
            </button>
            <div className="flex flex-wrap gap-1">
              {availableSources.map((source) => {
                const isSelected = selectedSources.has(source);
                return (
                  <button
                    key={source}
                    onClick={() => toggleSource(source)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-purple-100 text-purple-800'
                        : 'text-gray-500 bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    {source}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Log Display */}
      <div className="flex-1 overflow-hidden">
        <div
          ref={logContainerRef}
          className="h-full overflow-y-auto bg-gray-900 text-gray-100 font-mono text-sm"
        >
          {filteredLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-lg mb-2">No logs found</p>
                <p className="text-sm">
                  {logs.length === 0 ? 'Waiting for logs...' : 'Try adjusting your filters'}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 space-y-1">
              {filteredLogs.map((log, idx) => {
                const config = LOG_LEVEL_CONFIG[log.type];
                const Icon = config.icon;
                
                return (
                  <div
                    key={`${log.timestamp}-${idx}`}
                    className={`flex items-start gap-3 p-2 rounded hover:bg-gray-800/50 transition-colors ${config.bgColor}`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                      <Icon size={14} className={config.color} />
                      <span className="text-gray-400 text-xs">
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 min-w-0 flex-shrink-0">
                      <span className="text-purple-400 text-xs font-medium">
                        {log.source}
                      </span>
                      {log.requestId && (
                        <span className="text-blue-400 text-xs">
                          req:{log.requestId.slice(-8)}
                        </span>
                      )}
                      {log.userId && (
                        <span className="text-green-400 text-xs">
                          user:{log.userId.slice(-8)}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span className="text-gray-100 break-words">
                        {log.message}
                      </span>
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-1 text-xs text-gray-400">
                          {JSON.stringify(log.metadata, null, 2)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      {/* How Logging Works Modal */}
      <HelpModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title="How Logging Works"
        description="Learn how to effectively use the centralized logging system to monitor, debug, and analyze your application."
        sections={helpSections}
      />
    </div>
  );
};

export default LogViewer;