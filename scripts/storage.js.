// This handles saving and loading data so it persists between app sessions
export const KEY = 'sft:data:v1';

let cachedData = null;
let lastSaveTime = 0;
const SAVE_THROTTLE = 100; // Wait this many milliseconds between saves to improve performance

export function load(){
  if(cachedData) return cachedData;
  
  try {
    const raw = localStorage.getItem(KEY);
    if(!raw) return null;
    
    cachedData = JSON.parse(raw);
    return cachedData;
  } catch(e) {
    console.error('Storage load failed:', e);
    return null;
  }
}

export function save(data){
  const now = Date.now();
  if(now - lastSaveTime < SAVE_THROTTLE) {
    // Don't save too frequently - wait a bit if we just saved recently
    setTimeout(() => save(data), SAVE_THROTTLE);
    return true;
  }
  
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    cachedData = data;
    lastSaveTime = now;
    return true;
  } catch(e) {
    console.error('Storage save failed:', e);
    return false;
  }
}
