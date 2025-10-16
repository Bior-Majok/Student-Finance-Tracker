import { compileRegex } from './validators.js';

export function highlight(text, re){
  if(!re || !text) return escapeHtml(text || '');
  
  try {
    return escapeHtml(String(text)).replace(re, match => `<mark>${match}</mark>`);
  } catch(err) {
    console.warn('Highlight error:', err);
    return escapeHtml(String(text));
  }
}

function escapeHtml(str){return String(str).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));}

export function safeCompile(input, caseSensitive){
  const re = compileRegex(input, caseSensitive);
  return re; // null on failure
}
