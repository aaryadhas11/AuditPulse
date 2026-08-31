# Smart Receipt Auditor & Expense Tracker

An AI-powered document intelligence web application built with Python and Streamlit that extracts itemized data from receipt images, validates billing mathematics against tax calculations, and exports structured audit logs.

## Features

- **Document Extraction:** Uses Gemini Vision API to convert unstructured receipt scans into structured JSON data.
- **Mathematical Reconciliation:** Automatically audits line items, calculated subtotals, and applied taxes (GST/VAT) against the final receipt total.
- **Interactive UI:** Streamlit-powered dashboard for previewing uploaded documents, reviewing audit results, and exporting data to CSV.

## Tech Stack

- **Frontend / Framework:** Streamlit
- **AI / OCR:** Google Gemini Vision API (`google-genai`)
- **Data Processing:** Pandas, Pillow
- **Language:** Python 3.10+

## Local Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/aaryadhas11/smart-receipt-auditor.git](https://github.com/aaryadhas11/smart-receipt-auditor.git)
   cd smart-receipt-auditor