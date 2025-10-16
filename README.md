# Student Finance Tracker

**Theme:** Student Finance Tracker

## Features
- Add/Edit/Delete transactions
- Regex-powered search and highlight
- Sorting by date/amount/description
- Budget cap with progress bar and ARIA live updates
- LocalStorage persistence; JSON import/export
- Accessible (skip link, focus states, ARIA live)

## Run locally
1. Clone repo
2. Open index.html in a browser (or use Live Server in VS Code)

## Regex catalog
- Description: `/^\S(?:.*\S)?$/` - no leading/trailing spaces
- Amount: `/^(0|[1-9]\d*)(\.\d{1,2})?$/`
- Date: `/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/`
- Category: `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`
- Duplicate words (advanced): `/\b(\w+)\s+\1\b/`

## Demo
Include an unlisted video link showing keyboard navigation and import/export.
