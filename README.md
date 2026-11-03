# AuditPulse — Smart GST & Corporate Expense Auditor Platform

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Production%20REST%20API-009688.svg)](https://fastapi.tiangolo.com/)
[![Streamlit](https://img.shields.io/badge/Streamlit-Interactive%20Console-FF4B4B.svg)](https://streamlit.io/)
[![Next.js](https://img.shields.io/badge/Next.js-16%20Turbopack-black.svg)](https://nextjs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%20ACID%20Persistence-4479A1.svg)](https://www.mysql.com/)
[![RAG](https://img.shields.io/badge/RAG-Hybrid%20Semantic%20Retrieval-orange.svg)]()
[![License](https://img.shields.io/badge/License-MIT-green.svg)]()

> **AuditPulse** is an enterprise-grade corporate expenditure intelligence and statutory tax compliance engine. It unifies multimodal Gemini Vision extraction, deterministic GST arithmetic reconciliation (CGST/SGST/IGST), Hybrid RAG corporate policy enforcement, and ACID-compliant MySQL database persistence behind a role-based access control (RBAC) security gateway.

---

## High-Level Architecture & End-to-End Data Pipeline

```
                                      [User / Auditor]
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       ▼                                           ▼
          [Next.js 16 FinTech Web App]                 [Streamlit Management Console]
              (Port 3000 / React)                         (Port 8501 / Python Native)
                       │                                           │
                       └─────────────────────┬─────────────────────┘
                                             │ Multipart File / REST
                                             ▼
                                  [FastAPI Gateway (app.py)]
                                  - JWT Bearer Authentication
                                  - File Size & Mime Validation
                                             │
                       ┌─────────────────────┼─────────────────────┐
                       ▼                     ▼                     ▼
          [Multimodal Vision Engine] [Deterministic Tax Engine] [Hybrid RAG Policy Engine]
              (extractor.py)                 (auditor.py)              (vector_store.py)
            - Gemini 2.5 Flash            - CGST Act §16 / §17(5)     - Dense Vector Cosine Sim
            - Pydantic ReceiptSchema      - State Code Jurisdiction   - BM25 Lexical Keyword Rank
            - Offline Heuristic Fallback  - Rounding (§170 tolerance) - Cosine Vector Deduplication
                       │                     │                     │
                       └─────────────────────┼─────────────────────┘
                                             ▼
                              [ACID Persistence Layer (database.py)]
                              - SQLAlchemy 2.0 ORM Engine
                              - MySQL 8.0 (Auto-migration + SQLite fallback)
                              - AuditRecord & AdminUser Tables
```

---

## Key Engineering Highlights

### 1. Multimodal Document Extraction (`extractor.py`)
- **Zero-Shot Document Parsing**: Leverages Google Gemini 2.5/2.0 Flash with strictly typed Pydantic models (`ReceiptSchema`).
- **Polymorphic Ingestion**: Automatically handles raw bytes, PIL `Image.Image`, `types.Part`, and local file paths for both images (`.jpg`, `.png`, `.webp`) and single/multi-page PDFs (`.pdf`).
- **Resilient Circuit-Breaker**: If external API credentials are unset or rate-limited (HTTP 429), smoothly degrades to an intelligent deterministic fallback without service interruption.

### 2. Forensic GST & Statutory Tax Reconciliation (`auditor.py`)
- **Indian State Code Verification**: Authenticates the 15-character alphanumeric format and verifies the 2-digit state code jurisdiction (01 to 38, or 97 for Other Territory).
- **Tax Breakdown Validation**: Reconciles intra-state transactions (CGST + SGST in equal 50:50 ratio) vs. inter-state transactions (IGST).
- **Statutory Blocked Credits (CGST Act Section 17(5))**: Flags disallowed input tax credit on food & beverages, personal entertainment, alcohol, and corporate club memberships.
- **Statutory Rounding Off (CGST Act Section 170)**: Evaluates mathematical reconciliation within a compliant ₹2.00 rounding boundary.

### 3. Production Hybrid RAG Store (`vector_store.py`)
- **Hybrid Retrieval**: Integrates dense vector embeddings (cosine similarity) with sparse lexical BM25-style keyword matching and exact clause code boosts (`Clause 6.1`, `Clause 4.2`, `Section 17(5)`).
- **In-Memory Vector Memory**: Embeds incoming receipts via `text-embedding-004` (or normalized deterministic dense vector) to flag duplicate claims with $\ge 92\%$ cosine similarity.

### 4. Enterprise Database & RBAC Security Gateway (`database.py`)
- **Database Engine**: SQLAlchemy ORM with connection pooling (`pool_recycle=3600`, `pool_pre_ping=True`) reading from standard environment variables with automatic fallback to SQLite (`auditpulse.db`).
- **ACID Transaction Rollbacks**: Wraps all mutations in clean try/except/rollback blocks to prevent orphaned sessions.
- **RBAC Authentication**: Bcrypt password hashing (`gensalt(10)`) and 24-hour HS256 JWT bearer tokens protecting sensitive database records.

---

## Quickstart & Local Installation

### Prerequisites
- Python 3.10+
- Node.js 18+ (for Next.js frontend)
- MySQL 8.0 (optional; automatically falls back to local SQLite)

### 1. Clone & Configure Dependencies
```powershell
git clone https://github.com/aaryadhas11/smart-receipt-auditor.git
cd reciept-ai-scanner

# Install Python dependencies
pip install -r requirements.txt
```

### 2. Configure Streamlit Community Cloud Secrets or Local Environment
For **Streamlit Community Cloud**, configure secrets in **App Settings -> Secrets**:
```toml
# Google Gemini API Key
GEMINI_API_KEY = "your-gemini-api-key"

# MySQL Database Configuration
DB_HOST = "your-mysql-host.example.com"
DB_USER = "your-database-username"
DB_PASSWORD = "your-database-password"
DB_NAME = "auditpulse"
DB_PORT = 3306

# Administrator Authentication Gateway
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "your-secure-admin-password"
```

For **Local Development**, copy `.streamlit/secrets.toml.example` to `.streamlit/secrets.toml` or create `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key"
JWT_SECRET="auditpulse-corporate-jwt-secret-2026-secure-key"

# Database Configuration (Optional - Defaults to SQLite if MySQL is unset)
DB_USER="root"
DB_PASSWORD=""
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="auditpulse"

ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-secure-admin-password"
```

### 3. Run Automated Test Suite
```powershell
pytest -v tests/test_auditpulse.py
```
*(Runs 13 comprehensive unit and integration tests covering GST validation, math reconciliation, Section 17(5) blocked credits, RAG retrieval, vector deduplication, and FastAPI REST endpoints).*

---

## Running the Applications

### Option A: Launch Streamlit Dashboard (Python Native / Cloud Ready)
```powershell
streamlit run streamlit_app.py
```
- Open [http://localhost:8501](http://localhost:8501)
- Admin Login: Sign in with the administrator credentials configured in `st.secrets` or `ADMIN_PASSWORD`.

### Option B: Launch Full-Stack Enterprise Stack (FastAPI + Next.js)

**Terminal 1 — FastAPI Backend:**
```powershell
uvicorn app:app --host 0.0.0.0 --port 8000 --reload
```
- API Documentation (Swagger): [http://localhost:8000/docs](http://localhost:8000/docs)

**Terminal 2 — Next.js 16 Web Dashboard:**
```powershell
cd frontend
npm install
npm run dev
```
- Open [http://localhost:3000](http://localhost:3000)
- Admin Login: Sign in with the credentials set in your environment / secrets configuration.

---

## API Documentation Summary

| Method | Endpoint | Access | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | System liveness, service status, and DB connection check |
| `GET` | `/api/stats` | Public | Live aggregated metrics (total spend, compliance rate, flags, accuracy) |
| `POST` | `/api/audit` | Public | Uploads and audits receipt (Vision OCR -> Math -> Policy -> MySQL) |
| `POST` | `/api/policy-check` | Public | Evaluates items against category-specific corporate bylaws |
| `POST` | `/api/chat` | Public | CA tax assistant answering statutory GST and policy queries |
| `POST` | `/api/auth/login` | Public | Validates admin credentials and issues 24-hr JWT bearer token |
| `GET` | `/api/auth/me` | Admin | Validates active JWT session and returns admin user profile |
| `GET` | `/api/admin/audit-logs` | Admin | RBAC-protected audit history with category and status filters |
| `PATCH` | `/api/admin/audit-logs/{id}` | Admin | Modifies audit record status (*Verified & Clean*, *Flagged*, etc.) |
| `DELETE` | `/api/admin/audit-logs/{id}` | Admin | Deletes an audit record from database with transaction rollback |