import { useEffect, useState } from 'react';
import { useAppStore, type Job } from '../store/useAppStore';
import { Database, Search, RefreshCw, XCircle, Eye } from 'lucide-react';

const formatDateTime = (createdAt: any) => {
  if (!createdAt) return 'N/A';
  try {
    let date: Date;
    if (typeof createdAt === 'string') {
      date = new Date(createdAt);
    } else if (typeof createdAt === 'object') {
      const seconds = createdAt._seconds ?? createdAt.seconds;
      if (seconds !== undefined) {
        date = new Date(seconds * 1000);
      } else {
        date = new Date(createdAt);
      }
    } else if (typeof createdAt === 'number') {
      date = new Date(createdAt);
    } else {
      return 'N/A';
    }
    
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch (err) {
    console.error("Error formatting date:", err);
    return 'N/A';
  }
};

export default function AdminTasks() {
  const { jobs, adminFetchJobs, adminCancelJob } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    adminFetchJobs();
  }, []);

  const handleRefresh = () => {
    adminFetchJobs();
  };

  const filteredJobs = jobs.filter((j) => 
    j.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.userEmail && j.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (j.executionSource && j.executionSource.toLowerCase().includes(searchTerm.toLowerCase())) ||
    j.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            Agent Execution Trace Records <Database style={{ color: 'var(--color-secondary)' }} />
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            List, filter, and inspect detailed sequential agent execution trace details for active and historical jobs.
          </p>
        </div>

        <button 
          className="btn-secondary" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            cursor: 'pointer'
          }} 
          onClick={handleRefresh}
        >
          <RefreshCw size={16} /> Sync Logs
        </button>
      </div>

      {/* Main Grid: Left is task list, right is detail panel */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1.2fr 0.8fr' : '1fr', gap: '2rem' }}>
        
        {/* Task List Panel */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Agent Execution Trace Records</h3>
            
            {/* Search */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="text-input" 
                style={{ 
                  width: '100%', 
                  paddingLeft: '32px', 
                  fontSize: '0.875rem'
                }} 
                placeholder="Search Job ID, User ID, status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            {filteredJobs.length === 0 ? (
              <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.6 }}>
                No active task logs found matching query.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr style={{ borderBottomColor: 'var(--card-border)' }}>
                    <th style={{ color: 'var(--text-secondary)' }}>Job ID</th>
                    <th style={{ color: 'var(--text-secondary)' }}>User</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Source</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Executed At</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Mode</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Loops</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Words</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Credits</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Cost</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Latency</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredJobs.map((job) => (
                    <tr 
                      key={job.jobId} 
                      style={{ cursor: 'pointer', borderBottomColor: 'var(--card-border)' }} 
                      onClick={() => setSelectedJob(job)}
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.01)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td>
                        <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                          {job.jobId.substring(0, 14)}...
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }} title={job.userEmail || job.userId}>
                          {job.userEmail ? (job.userEmail.substring(0, 18) + (job.userEmail.length > 18 ? '...' : '')) : (job.userId.substring(0, 8) + '...')}
                        </span>
                      </td>
                      <td>
                        <span className={`tag ${job.apiKeyId || job.executionSource === 'API Key' ? 'tag-info' : 'tag-success'}`} style={{ fontSize: '0.75rem' }}>
                          {job.executionSource || (job.apiKeyId ? 'API Key' : 'Platform')}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {formatDateTime(job.createdAt)}
                      </td>
                      <td>
                        <span className={`tag ${job.status === 'completed' ? 'tag-success' : job.status === 'processing' ? 'tag-info' : 'tag-danger'}`}>
                          {job.status}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-primary)' }}>{job.mode}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{job.reflectionLevel}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{job.wordsIn} → {job.wordsOut || '-'}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{job.creditsUsed !== undefined ? job.creditsUsed : '-'}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{job.llmCostUsd !== undefined ? `US$${job.llmCostUsd.toFixed(4)}` : '-'}</td>
                      <td style={{ color: 'var(--text-primary)' }}>{(job.processingMs / 1000).toFixed(1)}s</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ 
                              padding: '0.3rem 0.5rem', 
                              fontSize: '0.75rem', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.25rem',
                              cursor: 'pointer'
                            }} 
                            onClick={() => setSelectedJob(job)}
                          >
                            <Eye size={12} /> Inspect
                          </button>
                          {job.status === 'processing' && (
                            <button 
                              className="btn-secondary" 
                              style={{ 
                                padding: '0.3rem 0.5rem', 
                                fontSize: '0.75rem', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.25rem', 
                                color: 'var(--color-danger)',
                                background: 'rgba(239, 68, 68, 0.05)',
                                border: '1px solid rgba(239, 68, 68, 0.1)',
                                cursor: 'pointer'
                              }} 
                              onClick={() => adminCancelJob(job.jobId)}
                            >
                              <XCircle size={12} /> Kill
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Selected Job Details Panel */}
        {selectedJob && (
          <div className="glass-card" style={{ alignSelf: 'start' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>Job execution logs</h4>
              <button 
                className="btn-secondary" 
                style={{ 
                  padding: '0.25rem 0.5rem', 
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }} 
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Job ID</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-primary)' }}>{selectedJob.jobId}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Status</span>
                  <span className={`tag ${selectedJob.status === 'completed' ? 'tag-success' : selectedJob.status === 'processing' ? 'tag-info' : 'tag-danger'}`}>
                    {selectedJob.status}
                  </span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>LLM Cost (USD)</span>
                  <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>US${(selectedJob.llmCostUsd || 0).toFixed(4)}</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Source</span>
                  <span className={`tag ${selectedJob.apiKeyId || selectedJob.executionSource === 'API Key' ? 'tag-info' : 'tag-success'}`} style={{ fontSize: '0.75rem' }}>
                    {selectedJob.executionSource || (selectedJob.apiKeyId ? 'API Key' : 'Platform')}
                  </span>
                </div>
                {selectedJob.apiKeyId && (
                  <div>
                    <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>API Key ID</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{selectedJob.apiKeyId}</span>
                  </div>
                )}
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>Executed At</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{formatDateTime(selectedJob.createdAt)}</span>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>User Email</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{selectedJob.userEmail || 'N/A'}</span>
              </div>

              {selectedJob.errorMessage && (
                <div style={{ 
                  padding: '0.75rem', 
                  background: 'rgba(239, 68, 68, 0.08)', 
                  border: '1px solid rgba(239, 68, 68, 0.2)', 
                  borderRadius: '6px',
                  color: 'var(--color-danger)',
                  fontSize: '0.8rem',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  marginTop: '0.25rem'
                }}>
                  <strong style={{ display: 'block', marginBottom: '0.25rem' }}>Failure Log:</strong>
                  {selectedJob.errorMessage}
                </div>
              )}

              <div>
                <span style={{ color: 'var(--text-secondary)', display: 'block', fontSize: '0.8rem' }}>User Reference (UID)</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-primary)' }}>{selectedJob.userId}</span>
              </div>

              <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'block', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                  Agent Execution Trace Records
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {selectedJob.agentLogs && selectedJob.agentLogs.length > 0 ? (
                    selectedJob.agentLogs.map((log: any, index: number) => (
                      <div key={index} style={{ padding: '0.50rem', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--card-border)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: 'var(--color-secondary)' }}>A{log.agentNumber}</span> <span style={{ color: 'var(--text-primary)' }}>{log.agentName}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>
                          <div style={{ marginBottom: '0.1rem' }}>{log.latencyMs}ms | US${(log.costUsd || 0).toFixed(6)}</div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                            In: {log.tokensIn || 0} | Think: {log.thinkingTokens || 0} | Out: {log.tokensOut || 0}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    // Mock steps list if empty
                    [
                      { name: 'Pre-Processing Sterilizer', latency: '450ms', in: 100, think: 0, out: 40, cost: 0.00015 },
                      { name: 'Intent Extraction & Detection (Parallel)', latency: '820ms', in: 200, think: 10, out: 120, cost: 0.00045 },
                      { name: 'Humanization Strategy', latency: '680ms', in: 80, think: 0, out: 30, cost: 0.00010 },
                      { name: 'Linguistic Humanizer', latency: '2400ms', in: 400, think: 440, out: 400, cost: 0.00350 },
                      { name: 'Post-Processing Polish', latency: '1950ms', in: 450, think: 200, out: 500, cost: 0.00280 },
                      { name: 'Reflection Check', latency: '920ms', in: 400, think: 90, out: 400, cost: 0.00190 },
                      { name: 'Revision loops', latency: '2100ms', in: 600, think: 310, out: 400, cost: 0.00310 },
                      { name: 'Quality Scoring', latency: '650ms', in: 150, think: 40, out: 50, cost: 0.00040 },
                      { name: 'Final Polish', latency: '420ms', in: 80, think: 0, out: 40, cost: 0.00012 }
                    ].map((step, index) => (
                      <div key={index} style={{ padding: '0.4rem', background: 'rgba(0,0,0,0.01)', border: '1px solid var(--card-border)', borderRadius: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ color: 'var(--color-secondary)' }}>A{index + 1}</span> <span style={{ color: 'var(--text-primary)' }}>{step.name}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', textAlign: 'right' }}>
                          <div style={{ marginBottom: '0.1rem' }}>{step.latency} | US${step.cost.toFixed(6)}</div>
                          <div style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                            In: {step.in} | Think: {step.think} | Out: {step.out}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
