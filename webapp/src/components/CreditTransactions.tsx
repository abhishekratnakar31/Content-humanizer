import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const formatDateTime = (createdAt: any) => {
  if (!createdAt) return 'N/A';
  try {
    let date = new Date(createdAt);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (err) {
    return 'N/A';
  }
};

export default function CreditTransactions({ hideHeader = false }: { hideHeader?: boolean }) {
  const { user, creditTransactions, fetchCreditTransactions } = useAppStore();

  useEffect(() => {
    fetchCreditTransactions();
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {!hideHeader && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard size={24} style={{ color: 'var(--color-primary)' }} />
              Credit Transactions
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              View your credit usage and purchase history.
            </p>
          </div>
          
          <div className="glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Balance</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user?.credits?.toLocaleString() || 0} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>credits</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Transaction History</h3>
        </div>

        <div className="table-container">
          {creditTransactions.length === 0 ? (
            <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-secondary)', opacity: 0.6 }}>
              No transactions found.
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr style={{ borderBottomColor: 'var(--card-border)' }}>
                  <th style={{ color: 'var(--text-secondary)' }}>Date</th>
                  <th style={{ color: 'var(--text-secondary)' }}>Type</th>
                  <th style={{ color: 'var(--text-secondary)' }}>Details</th>
                  <th style={{ color: 'var(--text-secondary)' }}>Amount</th>
                  <th style={{ color: 'var(--text-secondary)' }}>Words</th>
                </tr>
              </thead>
              <tbody>
                {creditTransactions.map((tx) => (
                  <tr 
                    key={tx.id} 
                    style={{ borderBottomColor: 'var(--card-border)' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.01)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td>
                      <span className={`tag ${tx.type === 'purchase' || tx.type === 'refund' || tx.type === 'add' || tx.type === 'admin_grant' ? 'tag-success' : 'tag-danger'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem' }}>
                        {tx.type === 'purchase' || tx.type === 'refund' || tx.type === 'add' || tx.type === 'admin_grant' ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                      {tx.taskType ? (
                        <span style={{ fontWeight: 500 }}>
                          {tx.taskType}
                          {tx.mode ? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {tx.mode}</span> : null}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>{tx.tier || 'Upgrade Pack'}</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.8rem' }}>
                      <span style={{ color: tx.type === 'purchase' || tx.type === 'refund' || tx.type === 'add' || tx.type === 'admin_grant' ? 'var(--color-success)' : 'var(--color-danger)' }}>
                        {tx.type === 'purchase' || tx.type === 'refund' || tx.type === 'add' || tx.type === 'admin_grant' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                      {tx.wordsIn != null ? (
                        <span>
                          {tx.wordsIn}
                          {tx.wordsOut != null && tx.wordsOut > 0 ? <span style={{ color: 'var(--text-muted)' }}> → {tx.wordsOut}</span> : null}
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
