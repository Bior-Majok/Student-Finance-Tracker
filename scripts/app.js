import * as storage from './storage.js';
import { validate, compileRegex, patterns } from './validators.js';
import { safeCompile } from './search.js';
import { createRowHTML } from './ui.js';

// This keeps track of all our data - transactions, settings, and what the user is currently viewing
let state = {
  records: [],
  settings: { baseCurrency:'USD', rates:{RWF:1200,EUR:0.92}, monthlyCap:500 },
  ui: { sort:{field:'date',dir:'desc'}, search:null, caseSensitive:false }
};

// Getting references to all the buttons, forms, and display areas we need to work with
const views = document.querySelectorAll('.view');
const navButtons = document.querySelectorAll('.nav-btn');
const tbody = document.getElementById('transactions-tbody');
const emptyState = document.getElementById('empty-state');
const totalDisplay = document.getElementById('total-display');
const statCount = document.getElementById('stat-count');
const statTotal = document.getElementById('stat-total');
const statRecent = document.getElementById('stat-recent');
const statRecentCount = document.getElementById('stat-recent-count');
const statTopCategory = document.getElementById('stat-top-category');
const statTopAmount = document.getElementById('stat-top-amount');
const budgetSpent = document.getElementById('budget-spent');
const budgetCapDisplay = document.getElementById('budget-cap-display');
const budgetProgress = document.getElementById('budget-progress');
const budgetStatus = document.getElementById('budget-status');
const form = document.getElementById('transaction-form');
const submitText = document.getElementById('submit-text');
const btnCancel = document.getElementById('btn-cancel');
const categorySelect = document.getElementById('txn-category');
const searchInput = document.getElementById('search-input');
const caseCheckbox = document.getElementById('case-sensitive');
const sortButtons = document.querySelectorAll('.sort-btn');
const btnExport = document.getElementById('btn-export');
const btnImportTrigger = document.getElementById('btn-import-trigger');
const importFile = document.getElementById('import-file');
const baseCurrency = document.getElementById('base-currency');
const monthlyCapInput = document.getElementById('monthly-cap');
const btnClear = document.getElementById('btn-clear-data');
const status = document.getElementById('status-container');

let editingId = null;

// Starting up the app - loading saved data and setting everything up
function init(){
  try {
    // Load any transactions and settings we saved before
    const data = storage.load();
    if(data && data.records) {
      // Double-check that our saved data isn't corrupted
      if(Array.isArray(data.records)) {
        state = data;
      } else {
        console.warn('Invalid data structure, using defaults');
      }
    }
    // Create basic categories like Food, Books, Transport if this is the first time using the app
    ensureDefaultCategories();
    render();
    attachListeners();
  } catch(err) {
    console.error('Initialization error:', err);
    announce('App initialization failed', 'assertive');
  }
}

function ensureDefaultCategories(){
  const defaults = ['Food','Books','Transport','Entertainment','Fees','Other'];
  defaults.forEach(d=>{
    if(!state.settings.categories) state.settings.categories = [];
    if(!state.settings.categories.includes(d)) state.settings.categories.push(d);
  });
  populateCategorySelect();
}

function populateCategorySelect(){
  categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
  state.settings.categories.forEach(c=>{
    const opt = document.createElement('option'); opt.value=c; opt.textContent=c; categorySelect.appendChild(opt);
  });
}

function attachListeners(){
  navButtons.forEach(btn=>btn.addEventListener('click', onNavigate));
  form.addEventListener('submit', onSubmit);
  btnCancel.addEventListener('click', resetForm);
  tbody.addEventListener('click', onTableClick);
  searchInput.addEventListener('input', onSearchChange);
  caseCheckbox.addEventListener('change', onSearchChange);
  sortButtons.forEach(b=>b.addEventListener('click', onSort));
  btnExport.addEventListener('click', onExport);
  btnImportTrigger.addEventListener('click', ()=>importFile.click());
  importFile.addEventListener('change', onImportFile);
  baseCurrency.addEventListener('change', onSettingsChange);
  monthlyCapInput.addEventListener('change', onMonthlyCapChange);
  btnClear.addEventListener('click', onClear);
}

function onNavigate(e){
  navButtons.forEach(b=>b.classList.remove('active'));
  e.currentTarget.classList.add('active');
  const view = e.currentTarget.dataset.view;
  views.forEach(v=>v.classList.toggle('active', v.id===`view-${view}`));
  if(view==='add') resetForm();
}

function onSubmit(e){
  e.preventDefault();
  const description = document.getElementById('txn-description').value.trim();
  const amountRaw = document.getElementById('txn-amount').value.trim();
  const category = document.getElementById('txn-category').value;
  const date = document.getElementById('txn-date').value;
  const record = { id: editingId||`txn_${Date.now()}`, description, amount: Number(amountRaw), category, date, createdAt: new Date().toISOString(), updatedAt:new Date().toISOString() };

  const errors = validate(record);
  if(Object.keys(errors).length){
    Object.entries(errors).forEach(([k,m])=>{const el=document.getElementById('error-'+k); if(el) el.textContent=m});
    announce('Form has errors', 'polite');
    return;
  }
  // Remove any error messages from the form
  document.querySelectorAll('.error-message').forEach(x=>x.textContent='');

  if(editingId){
    state.records = state.records.map(r=> r.id===editingId? {...record, createdAt: state.records.find(rr=>rr.id===editingId).createdAt } : r);
    editingId = null; submitText.textContent='Add Transaction'; btnCancel.style.display='none';
    announce('Record updated','polite');
  }else{
    state.records.push(record);
    announce('Record added','polite');
  }
  save(); render();
}

function resetForm(){ form.reset(); editingId=null; submitText.textContent='Add Transaction'; btnCancel.style.display='none'; document.querySelectorAll('.error-message').forEach(x=>x.textContent=''); }

function onTableClick(e){
  const id = e.target.dataset.id;
  if(e.target.classList.contains('btn-edit')){
    const rec = state.records.find(r=>r.id===id); if(!rec) return;
    document.getElementById('txn-description').value=rec.description;
    document.getElementById('txn-amount').value=rec.amount;
    document.getElementById('txn-category').value=rec.category;
    document.getElementById('txn-date').value=rec.date;
    editingId = id; submitText.textContent='Update Transaction'; btnCancel.style.display='inline-block'; announce('Edit mode');
  }
  if(e.target.classList.contains('btn-delete')){
    if(confirm('Confirm delete?')){ state.records = state.records.filter(r=>r.id!==id); save(); render(); announce('Record deleted'); }
  }
}

function onSearchChange(){ state.ui.search = searchInput.value; state.ui.caseSensitive = caseCheckbox.checked; render(); }

function onSort(e){ const field = e.currentTarget.dataset.sort; if(state.ui.sort.field===field) state.ui.sort.dir = state.ui.sort.dir==='asc'?'desc':'asc'; else { state.ui.sort.field=field; state.ui.sort.dir='asc' } render(); }

function onExport(){ 
  try {
    const data = JSON.stringify(state, null, 2); 
    const blob = new Blob([data], {type:'application/json'}); 
    const url = URL.createObjectURL(blob); 
    const a=document.createElement('a'); 
    a.href=url; 
    a.download='student-finance-data.json'; 
    document.body.appendChild(a); 
    a.click(); 
    a.remove(); 
    URL.revokeObjectURL(url); 
    announce('Export ready'); 
  } catch(err) {
    console.error('Export error:', err);
    announce('Export failed', 'assertive');
  }
}

function onImportFile(e){ 
  const f = e.target.files[0]; 
  if(!f) return; 
  const reader = new FileReader(); 
  reader.onload = ()=>{ 
    try{ 
      const parsed = JSON.parse(reader.result); 
      if(!parsed.records || !Array.isArray(parsed.records)) throw new Error('Invalid structure'); 
      // Check that each transaction has all the required information
      const bad = parsed.records.some(r=> !r.id||!r.description||typeof r.amount !== 'number'); 
      if(bad) throw new Error('Invalid record items'); 
      // Clean up the imported data to prevent security issues
      const sanitizedState = {
        records: parsed.records.map(r => ({
          id: String(r.id).replace(/[<>"'&]/g, ''),
          description: String(r.description).replace(/[<>"'&]/g, ''),
          amount: Number(r.amount),
          category: String(r.category).replace(/[<>"'&]/g, ''),
          date: String(r.date),
          createdAt: r.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })),
        settings: parsed.settings || state.settings,
        ui: parsed.ui || state.ui
      };
      state = sanitizedState; 
      save(); 
      render(); 
      announce('Import complete'); 
    }catch(err){ 
      console.error('Import error:', err);
      announce('Import failed: ' + err.message, 'assertive'); 
    } 
  }; 
  reader.onerror = () => announce('File read error', 'assertive');
  reader.readAsText(f); 
}

function onSettingsChange(){ state.settings.baseCurrency = baseCurrency.value; save(); render(); }

function onMonthlyCapChange(e){ state.settings.monthlyCap = Number(e.target.value)||500; save(); render(); }

function onClear(){ if(confirm('Clear all app data?')){ localStorage.clear(); state = {records:[], settings:{baseCurrency:'USD', rates:{RWF:1200,EUR:0.92}, monthlyCap:500}, ui:{sort:{field:'date',dir:'desc'}, search:null, caseSensitive:false}}; save(); render(); announce('All data cleared'); } }

function render(){
  // Refresh what the user sees with any new changes
  populateCategorySelect();
  renderTable();
  updateStats();
  // Update the settings page to show what's currently selected
  document.getElementById('monthly-cap').value = state.settings.monthlyCap;
  baseCurrency.value = state.settings.baseCurrency;
}

function renderTable(){
  const re = safeCompile(state.ui.search, state.ui.caseSensitive);
  let list = [...state.records];
  
  // Hide transactions that don't match what the user typed in the search box
  if(re && state.ui.search) {
    list = list.filter(rec => 
      re.test(rec.description) || 
      re.test(String(rec.amount)) || 
      re.test(rec.category)
    );
  }
  
  // Put transactions in order - newest first, highest amount, alphabetical, etc.
  list.sort((a,b)=>{
    const f=state.ui.sort.field; const dir = state.ui.sort.dir==='asc'?1:-1;
    if(f==='amount') return (a.amount-b.amount)*dir;
    if(f==='date') return (new Date(a.date)-new Date(b.date))*dir;
    return a.description.localeCompare(b.description)*dir;
  });

  tbody.innerHTML='';
  if(list.length===0){ emptyState.style.display='block'; return } else emptyState.style.display='none';
  
  // Create all the transaction rows together so the page loads faster
  const fragment = document.createDocumentFragment();
  list.forEach(rec=>{ 
    const div = document.createElement('div');
    div.innerHTML = createRowHTML(rec, re);
    fragment.appendChild(div.firstElementChild);
  });
  tbody.appendChild(fragment);
}

function updateStats(){
  const total = state.records.reduce((s,r)=>s+(r.amount||0),0);
  const count = state.records.length;
  const now = new Date();
  const recent = state.records.filter(r=> {
    const recordDate = new Date(r.date);
    return !isNaN(recordDate) && (now - recordDate)/(1000*60*60*24) <=7;
  });
  const recentTotal = recent.reduce((s,r)=>s+(r.amount||0),0);
  const catTotals = new Map();
  state.records.forEach(r=>{
    if(r.category) {
      catTotals.set(r.category, (catTotals.get(r.category)||0)+(r.amount||0));
    }
  });
  const top = Array.from(catTotals.entries()).sort((a,b)=>b[1]-a[1])[0]||['N/A',0];

  totalDisplay.textContent = `${state.settings.baseCurrency} ${total.toFixed(2)}`;
  statCount.textContent = count;
  statTotal.textContent = `${state.settings.baseCurrency} ${total.toFixed(2)}`;
  statRecent.textContent = `${state.settings.baseCurrency} ${recentTotal.toFixed(2)}`;
  statRecentCount.textContent = `${recent.length} transactions`;
  statTopCategory.textContent = top[0]; statTopAmount.textContent = `${state.settings.baseCurrency} ${top[1].toFixed(2)}`;

  budgetSpent.textContent = `${state.settings.baseCurrency} ${total.toFixed(2)}`;
  budgetCapDisplay.textContent = `${state.settings.baseCurrency} ${state.settings.monthlyCap.toFixed(2)}`;
  const percent = Math.min((total/state.settings.monthlyCap)*100,100);
  budgetProgress.style.width = percent+"%";
  if(total > state.settings.monthlyCap){ budgetStatus.textContent='Budget exceeded!'; budgetStatus.setAttribute('aria-live','assertive'); }
  else { budgetStatus.textContent='Within budget'; budgetStatus.setAttribute('aria-live','polite'); }
}

function save(){ storage.save(state); }

function announce(msg, mode='polite'){ status.textContent = msg; status.classList.add('visible'); setTimeout(()=>status.classList.remove('visible'),2200); }

init();
