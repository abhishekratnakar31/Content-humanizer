import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Database, Search, RefreshCw, Play } from 'lucide-react';

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

export default function History({ hideHeader = false }: { hideHeader?: boolean }) {
  const { userHistory, fetchUserHistory, resumeTask } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleResume = (job: any) => {
    resumeTask(job);
    navigate('/dashboard/playground');
  };

  useEffect(() => {
    fetchUserHistory();
  }, []);

  const handleRefresh = () => {
    fetchUserHistory();
  };

  const filteredHistory = userHistory.filter((j) => 
    j.jobId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.executionSource && j.executionSource.toLowerCase().includes(searchTerm.toLowerCase())) ||
    j.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (j.inputText && j.inputText.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (j.outputText && j.outputText.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header */}
      {!hideHeader && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              My History <Database style={{ color: 'var(--color-secondary)' }} />
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Review your past humanization tasks and their outputs.
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
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Task List Panel */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Execution Records</h3>
            
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
                placeholder="Search status, text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-container">
            {filteredHistory.length === 0 ? (
              <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.6 }}>
                No task logs found matching query.
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr style={{ borderBottomColor: 'var(--card-border)' }}>
                    <th style={{ color: 'var(--text-secondary)' }}>Executed At</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Words</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Status</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Text Preview</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Credits</th>
                    <th style={{ color: 'var(--text-secondary)' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((job) => (
                    <tr 
                      key={job.jobId} 
                      style={{ borderBottomColor: 'var(--card-border)' }} 
                      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.01)'}
                      onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {formatDateTime(job.createdAt)}
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {job.wordsIn} words
                      </td>
                      <td>
                        <span className={`tag ${job.status === 'completed' ? 'tag-success' : job.status === 'processing' ? 'tag-info' : 'tag-danger'}`} style={{ fontSize: '0.7rem' }}>
                          {job.status}
                        </span>
                      </td>
                      <td>
                        <div className="tooltip-container history-tooltip-container">
                          <div style={{ maxWidth: '140px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                            {job.inputText || '-'}
                          </div>
                          {job.inputText && (
                            <span className="tooltip-text">
                              {job.inputText}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                        {job.creditsUsed !== undefined ? job.creditsUsed.toLocaleString() : '-'}
                      </td>
                      <td>
                        <button
                          onClick={() => handleResume(job)}
                          className="btn-secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Resume Task"
                        >
                          <Play size={12} /> Resume
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
