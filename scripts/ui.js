import { highlight } from './search.js';

export function createRowHTML(txn, re){
  try {
    if(!txn || !txn.id) {
      console.warn('Invalid transaction data');
      return '<tr><td colspan="5">Invalid data</td></tr>';
    }
    
    const desc = re ? highlight(txn.description || '', re) : escapeHtml(txn.description || '');
    const amount = re ? highlight(String(txn.amount || 0), re) : escapeHtml(String((txn.amount || 0).toFixed(2)));
    
    return `
      <tr data-id="${escapeHtml(txn.id)}">
        <td><span class="desc">${desc}</span></td>
        <td><span class="amt">${amount}</span></td>
        <td>${escapeHtml(txn.category || '')}</td>
        <td>${escapeHtml(txn.date || '')}</td>
        <td>
          <button class="btn btn-small btn-edit" data-id="${escapeHtml(txn.id)}" aria-label="Edit ${escapeHtml(txn.description || 'transaction')}">✏️</button>
          <button class="btn btn-small btn-delete" data-id="${escapeHtml(txn.id)}" aria-label="Delete ${escapeHtml(txn.description || 'transaction')}">🗑️</button>
        </td>
      </tr>`;
  } catch(err) {
    console.error('Error creating row HTML:', err);
    return '<tr><td colspan="5">Error rendering transaction</td></tr>';
  }
}

function escapeHtml(str){return String(str).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));}
