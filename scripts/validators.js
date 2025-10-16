export const patterns = {
  description: /^\S(?:.*\S)?$/,
  amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
  date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
  category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
  duplicateWords: /\b(\w+)\s+\1\b/
};

export function validate(record){
  const errors = {};
  
  try {
    // Validate required fields exist
    if(!record || typeof record !== 'object') {
      errors.general = 'Invalid record format';
      return errors;
    }
    
    if(!record.description || !patterns.description.test(String(record.description))) {
      errors.description = 'Description must be non-empty and not just whitespace';
    }
    
    if(record.amount === undefined || record.amount === null || !patterns.amount.test(String(record.amount))) {
      errors.amount = 'Amount must be a valid positive number with up to 2 decimal places';
    }
    
    if(!record.date || !patterns.date.test(String(record.date))) {
      errors.date = 'Date must be in YYYY-MM-DD format';
    }
    
    if(!record.category || !patterns.category.test(String(record.category))) {
      errors.category = 'Category must contain only letters, spaces, and hyphens';
    }
    
    if(record.description && patterns.duplicateWords.test(String(record.description))) {
      errors.description = 'Duplicate consecutive words not allowed';
    }
  } catch(err) {
    console.error('Validation error:', err);
    errors.general = 'Validation failed';
  }
  
  return errors;
}

export function compileRegex(input, caseSensitive=false){
  if(!input || typeof input !== 'string') return null;
  
  try {
    // Sanitize input to prevent ReDoS attacks
    const sanitized = input.slice(0, 100); // limit length
    
    // strip surrounding slashes if user used /pattern/flags
    let pattern = sanitized; 
    let flags = caseSensitive ? '' : 'i';
    
    if(pattern.startsWith('/') && pattern.lastIndexOf('/') > 0){
      const last = pattern.lastIndexOf('/');
      const userFlags = pattern.slice(last+1);
      // Only allow safe flags
      flags = userFlags.replace(/[^gim]/g, '') || flags;
      pattern = pattern.slice(1, last);
    }
    
    // Basic validation to prevent dangerous patterns
    if(pattern.includes('(?') || pattern.includes('*+') || pattern.includes('+*')) {
      return null; // Potentially dangerous regex
    }
    
    return new RegExp(pattern, flags);
  } catch(e) {
    console.warn('Regex compilation failed:', e.message);
    return null;
  }
}
