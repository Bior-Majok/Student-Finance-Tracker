# Student Finance Tracker

**Theme:**  
Student Finance Tracker is a web-based application designed to help students manage their personal finances effectively. Track your transactions, monitor budgets, and analyze your spending—all in one accessible and easy-to-use platform.

## **Features**
### **1. Transaction Management**
- **Add transactions** – Quickly record income or expenses.  
- **Edit transactions** – Update transaction details if needed.  
- **Delete transactions** – Remove outdated or incorrect entries.  

### **2. Regex-Powered Search**
- Search transactions by **description, category, amount, or date**.  
- Highlight matching results dynamically for easy reference.  

### **3. Sorting**
- Sort transactions by:  
  - **Date**  
  - **Amount**  
  - **Description**  
- Helps analyze trends or find specific entries quickly.  

### **4. Budget Tracking**
- Set a **budget cap** to monitor your spending limits.  
- **Progress bar** shows real-time spending against the budget.  
- Includes **ARIA live updates** for accessibility and screen reader support.  

### **5. Data Persistence**
- Transactions are stored in **LocalStorage** for persistence across sessions.  
- Supports **JSON import/export** for backup or sharing.  

### **6. Accessibility**
- **Skip links** for easy navigation.  
- Clear **focus states** for interactive elements.  
- **ARIA live regions** provide real-time updates for screen readers.  


## **Run Locally**
1. Clone the repository:  
   ```bash
   git clone https://github.com/Bior-Majok/student-finance-tracker.git

## Regex catalog
- Description: /^\S(?:.*\S)?$/ - no leading/trailing spaces
- Amount: /^(0|[1-9]\d*)(\.\d{1,2})?$/
- Date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
- Category: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/
- Duplicate words (advanced): /\b(\w+)\s+\1\b/

## In the demo video, I demonstrate:
-User Interface from ideation of the design to the final design
-Regex search with edge cases.
-Import/export functionality.
-Responsive design across multiple devices.

Keyboard Map
-Tab: Navigate through form fields and buttons

-Enter: Submit form or trigger actions

-Arrow keys: Navigate through transaction records (sorting, search)

-Escape: Close modals or exit editing mode

## Demo
https://youtu.be/WL02y3hg3zQ
