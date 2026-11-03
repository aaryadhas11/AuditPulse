import os
import json
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, List
from urllib.parse import quote_plus
from dotenv import load_dotenv
import bcrypt
import jwt
import mysql.connector
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    desc,
    func,
    text,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session

load_dotenv()
logger = logging.getLogger("auditpulse.database")

SECRET_KEY = os.getenv("JWT_SECRET", "auditpulse-corporate-jwt-secret-2026-secure-key")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

Base = declarative_base()

class AuditRecord(Base):
    __tablename__ = "audit_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    receipt_code = Column(String(64), index=True, nullable=False)
    employee_name = Column(String(128), default="Aarya Dhas", nullable=False)
    department = Column(String(128), default="Engineering", nullable=False)
    category = Column(String(64), default="dining", nullable=False)  # dining, flight, hotel, cab
    submission_date = Column(String(64), default="")
    request_status = Column(String(64), default="Verified & Clean", nullable=False)  # 'Verified & Clean', 'Pending Supervisor Review', 'Flagged as Fraud'
    fraud_category = Column(String(128), nullable=True)  # 'Arithmetic Manipulation', 'GSTIN Format Mismatch', 'Per-Head Cap Exceeded', 'None'
    fraud_details = Column(Text, nullable=True)
    vendor_name = Column(String(128), default="Establishment", nullable=False)
    invoice_number = Column(String(64), default="INV-001")
    gstin = Column(String(32), default="27AAKCS3053N1ZW")
    subtotal = Column(Float, default=0.0)
    cgst = Column(Float, default=0.0)
    sgst = Column(Float, default=0.0)
    igst = Column(Float, default=0.0)
    grand_total = Column(Float, default=0.0)
    confidence_score = Column(Float, default=96.4)
    extracted_metadata = Column(Text, default="{}")  # JSON
    audit_results = Column(Text, default="{}")       # JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        try:
            meta = json.loads(self.extracted_metadata) if self.extracted_metadata else {}
        except Exception:
            meta = {}
        try:
            results = json.loads(self.audit_results) if self.audit_results else {}
        except Exception:
            results = {}

        return {
            "id": self.id,
            "receipt_code": self.receipt_code,
            "employee_name": self.employee_name,
            "department": self.department,
            "category": self.category,
            "submission_date": self.submission_date or (self.created_at.strftime("%d %b, %Y") if self.created_at else ""),
            "request_status": self.request_status,
            "fraud_category": self.fraud_category or "None",
            "fraud_details": self.fraud_details or "Compliant with corporate expenditure bylaws.",
            "vendor_name": self.vendor_name,
            "invoice_number": self.invoice_number,
            "gstin": self.gstin,
            "subtotal": round(float(self.subtotal or 0.0), 2),
            "cgst": round(float(self.cgst or 0.0), 2),
            "sgst": round(float(self.sgst or 0.0), 2),
            "igst": round(float(self.igst or 0.0), 2),
            "grand_total": round(float(self.grand_total or 0.0), 2),
            "confidence_score": round(float(self.confidence_score or 95.0), 1),
            "extracted_metadata": meta,
            "audit_results": results,
            "created_at": self.created_at.isoformat() if self.created_at else "",
            "updated_at": self.updated_at.isoformat() if self.updated_at else "",
        }

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(64), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(128), default="Administrator")
    role = Column(String(32), default="admin")
    created_at = Column(DateTime, default=datetime.utcnow)


def get_db_credentials() -> Dict[str, Any]:
    """
    Dynamically retrieves MySQL database credentials from Streamlit Community Cloud
    secure configuration (st.secrets) or environment variables (.env / os.environ).
    """
    host = None
    user = None
    password = None
    name = None
    port = 3306

    # 1. Primary: Streamlit Community Cloud secure configuration (st.secrets)
    try:
        import streamlit as st
        if hasattr(st, "secrets") and "DB_HOST" in st.secrets:
            host = st.secrets["DB_HOST"]
            user = st.secrets["DB_USER"]
            password = st.secrets["DB_PASSWORD"]
            name = st.secrets["DB_NAME"]
            port = int(st.secrets.get("DB_PORT", 3306))
    except Exception:
        pass

    # 2. Secondary: Fallback to environment variables
    if not host:
        host = os.getenv("DB_HOST", "localhost")
    if not user:
        user = os.getenv("DB_USER", "root")
    if password is None:
        password = os.getenv("DB_PASSWORD", "")
    if not name:
        name = os.getenv("DB_NAME", "auditpulse")
    if not port:
        try:
            port = int(os.getenv("DB_PORT", 3306))
        except Exception:
            port = 3306

    return {
        "host": host,
        "user": user,
        "password": password,
        "name": name,
        "port": port,
    }


def get_mysql_connection():
    """
    Connects to MySQL dynamically reading credentials using:
      st.secrets["DB_HOST"], st.secrets["DB_USER"], st.secrets["DB_PASSWORD"],
      st.secrets["DB_NAME"], and st.secrets.get("DB_PORT", 3306).
    Falls back gracefully to environment variables if st.secrets is unavailable.
    """
    try:
        import streamlit as st
        if hasattr(st, "secrets") and "DB_HOST" in st.secrets:
            return mysql.connector.connect(
                host=st.secrets["DB_HOST"],
                user=st.secrets["DB_USER"],
                password=st.secrets["DB_PASSWORD"],
                database=st.secrets["DB_NAME"],
                port=int(st.secrets.get("DB_PORT", 3306)),
            )
    except Exception as e:
        logger.debug(f"Direct st.secrets mysql.connector attempt note: {e}")

    creds = get_db_credentials()
    return mysql.connector.connect(
        host=creds["host"] or "localhost",
        user=creds["user"] or "root",
        password=creds["password"] or "",
        database=creds["name"] or "auditpulse",
        port=int(creds["port"] or 3306),
    )


def build_database_url() -> str:
    """Builds MySQL URL from st.secrets or standard environment variables, or falls back to SQLite."""
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return db_url

    creds = get_db_credentials()
    db_host = creds["host"]
    db_user = creds["user"]
    db_password = creds["password"]
    db_name = creds["name"]
    db_port = creds["port"]

    if db_user and db_password is not None and db_host:
        user_enc = quote_plus(str(db_user))
        pass_enc = quote_plus(str(db_password))
        return f"mysql+pymysql://{user_enc}:{pass_enc}@{db_host}:{db_port}/{db_name}?charset=utf8mb4"

    return "sqlite:///./auditpulse.db"


def get_engine_and_session():
    """Initializes database engine with resilience fallback to SQLite."""
    primary_url = build_database_url()
    is_mysql = primary_url.startswith("mysql")

    if is_mysql:
        try:
            creds = get_db_credentials()
            db_user = creds["user"] or "root"
            db_password = creds["password"] or ""
            db_host = creds["host"] or "localhost"
            db_port = creds["port"] or 3306
            db_name = creds["name"] or "auditpulse"

            root_url = f"mysql+pymysql://{quote_plus(db_user)}:{quote_plus(db_password)}@{db_host}:{db_port}/?charset=utf8mb4"
            
            temp_eng = create_engine(root_url, connect_args={"connect_timeout": 3})
            with temp_eng.connect() as conn:
                conn.execute(text(f"CREATE DATABASE IF NOT EXISTS `{db_name}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"))
            temp_eng.dispose()

            eng = create_engine(primary_url, pool_recycle=3600, pool_pre_ping=True)
            with eng.connect() as conn:
                pass
            print(f"[AuditPulse DB] Successfully connected to MySQL at {db_host}:{db_port}/{db_name}")
            return eng, sessionmaker(autocommit=False, autoflush=False, bind=eng), "mysql"
        except Exception as e:
            print(f"[AuditPulse DB] MySQL connection unavailable ({e}). Falling back to local resilient database: auditpulse.db")

    # Fallback SQLite
    sqlite_url = "sqlite:///./auditpulse.db"
    eng = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    print("[AuditPulse DB] Running on resilient SQLite database: auditpulse.db")
    return eng, sessionmaker(autocommit=False, autoflush=False, bind=eng), "sqlite"


engine, SessionLocal, DB_TYPE = get_engine_and_session()


def get_db():
    """FastAPI Dependency for database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=10)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except Exception:
        return None


def calculate_confidence_score(extracted_data: dict, audit_res: dict) -> float:
    """Calculates granular, deterministic AI Extraction Confidence score based on parsing completeness and verification."""
    score = 70.0

    # 1. Merchant Presence
    merchant = str(extracted_data.get("merchant_name") or "").strip()
    if merchant and merchant.lower() != "n/a" and len(merchant) > 2:
        score += 8.0

    # 2. Date Presence
    date_val = str(extracted_data.get("date") or "").strip()
    if date_val and date_val.lower() != "n/a":
        score += 5.0

    # 3. GSTIN Check
    gstin = str(extracted_data.get("gstin") or "").strip()
    if gstin and len(gstin) == 15 and gstin[0:2].isdigit() and gstin[2:7].isalpha():
        score += 6.5
    elif gstin and gstin.lower() != "n/a":
        score += 3.0

    # 4. Line Items Quality
    items = extracted_data.get("items") or []
    if len(items) >= 1:
        score += 5.0
        if any(float(it.get("price", 0.0)) > 0 for it in items):
            score += 3.5

    # 5. Math & Reconciliation Consistency
    if audit_res.get("math_valid"):
        score += 4.0
    else:
        score -= 12.0

    if audit_res.get("gstin_valid", True):
        score += 2.0
    else:
        score -= 6.0

    # Cap between 60.0% and 99.4%
    return round(max(60.0, min(99.4, score)), 1)


def seed_initial_data(db: Session):
    """Provisions default Admin user and seed records if tables are fresh."""
    # 1. Ensure default Admin exists
    admin = db.query(AdminUser).filter(AdminUser.username == "admin").first()
    default_admin_user = os.getenv("ADMIN_USERNAME", "admin")
    default_admin_pass = os.getenv("ADMIN_PASSWORD")

    try:
        import streamlit as st
        if hasattr(st, "secrets"):
            default_admin_user = st.secrets.get("ADMIN_USERNAME", default_admin_user)
            default_admin_pass = st.secrets.get("ADMIN_PASSWORD", default_admin_pass)
    except Exception:
        pass

    if not default_admin_pass:
        default_admin_pass = os.getenv("ADMIN_DEFAULT_PASSWORD", "admin")

    if not admin:
        default_admin = AdminUser(
            username=default_admin_user,
            password_hash=hash_password(default_admin_pass),
            full_name="Administrator",
            role="admin",
        )
        db.add(default_admin)
        db.commit()
        print(f"[AuditPulse DB] Provisioned initial administrator account: '{default_admin_user}'.")
    elif default_admin_pass:
        # Synchronize password hash with configured secret
        admin.password_hash = hash_password(default_admin_pass)
        db.commit()

    # 2. Seed initial sample records if audit_records is empty
    count = db.query(AuditRecord).count()
    if count == 0:
        sample_records = [
            AuditRecord(
                receipt_code="RCPT-98241",
                employee_name="Aarya Dhas",
                department="Engineering",
                category="dining",
                submission_date="14 Oct, 2026",
                request_status="Flagged as Fraud",
                fraud_category="Arithmetic Manipulation",
                fraud_details="Discrepancy Detected: Stated bill total ₹1,438.00 differs from mathematical line-item sum ₹1,200.00 + GST. Possible manual bill alteration.",
                vendor_name="Barbeque Nation Hospitality",
                invoice_number="CHK-98241",
                gstin="27AAKCS3053N1ZW",
                subtotal=1200.00,
                cgst=30.00,
                sgst=30.00,
                grand_total=1438.00,
                confidence_score=78.5,
                extracted_metadata=json.dumps({"merchant_name": "Barbeque Nation Hospitality", "items": [{"item_name": "Lunch Buffet", "quantity": 1, "price": 1200.0}]}),
                audit_results=json.dumps({"math_valid": False, "math_msg": "Mathematical discrepancy of ₹178.00 between line items and total."}),
                created_at=datetime.utcnow() - timedelta(days=2),
            ),
            AuditRecord(
                receipt_code="RCPT-6E902",
                employee_name="Aarya Dhas",
                department="Engineering",
                category="flight",
                submission_date="16 Oct, 2026",
                request_status="Pending Supervisor Review",
                fraud_category="Air Travel Class Infraction",
                fraud_details="Policy Clause 6.1 Review: Domestic flight booked in Business Class. Domestic flights require standard Economy Class unless approved by VP.",
                vendor_name="IndiGo Airlines (InterGlobe)",
                invoice_number="6E-9024B",
                gstin="07AABCI1234F1Z1",
                subtotal=7400.00,
                cgst=185.00,
                sgst=185.00,
                grand_total=7770.00,
                confidence_score=97.8,
                extracted_metadata=json.dumps({"merchant_name": "IndiGo Airlines", "items": [{"item_name": "DEL to BOM Airfare", "quantity": 1, "price": 7400.0}]}),
                audit_results=json.dumps({"math_valid": True, "policy_flags": ["Business Class booking requires VP exception waiver."]}),
                created_at=datetime.utcnow() - timedelta(days=1),
            ),
            AuditRecord(
                receipt_code="RCPT-UB410",
                employee_name="Aarya Dhas",
                department="Engineering",
                category="cab",
                submission_date="18 Oct, 2026",
                request_status="Verified & Clean",
                fraud_category="None",
                fraud_details="Fully compliant with Clause 3.1 Ground Transit policy. Valid tax invoice and approved commute corridor.",
                vendor_name="Uber India Systems Pvt Ltd",
                invoice_number="UBR-49102",
                gstin="27AABCU9603R1ZM",
                subtotal=410.00,
                cgst=10.25,
                sgst=10.25,
                grand_total=430.50,
                confidence_score=98.6,
                extracted_metadata=json.dumps({"merchant_name": "Uber India", "items": [{"item_name": "Airport Transit Ride", "quantity": 1, "price": 410.0}]}),
                audit_results=json.dumps({"math_valid": True, "policy_flags": []}),
                created_at=datetime.utcnow(),
            ),
        ]
        db.add_all(sample_records)
        db.commit()
        print("[AuditPulse DB] Seeded 3 initial expense audit records.")


def get_dashboard_stats(db: Session) -> Dict[str, Any]:
    """Calculates dynamic real-time dashboard metrics from the database."""
    total_records = db.query(func.count(AuditRecord.id)).scalar() or 0
    verified_clean = db.query(func.count(AuditRecord.id)).filter(AuditRecord.request_status == "Verified & Clean").scalar() or 0
    flagged_fraud = db.query(func.count(AuditRecord.id)).filter(AuditRecord.request_status == "Flagged as Fraud").scalar() or 0
    pending_review = db.query(func.count(AuditRecord.id)).filter(AuditRecord.request_status == "Pending Supervisor Review").scalar() or 0
    total_volume = db.query(func.sum(AuditRecord.grand_total)).scalar() or 0.0

    discrepancies_total = flagged_fraud + pending_review

    if total_records > 0:
        compliance_rate = round((verified_clean / total_records) * 100.0, 1)
        avg_confidence = db.query(func.avg(AuditRecord.confidence_score)).scalar() or 96.4
        accuracy = round(float(avg_confidence), 1)
    else:
        compliance_rate = 100.0
        accuracy = 99.4

    recent_logs = (
        db.query(AuditRecord)
        .order_by(desc(AuditRecord.created_at))
        .limit(5)
        .all()
    )

    return {
        "total_receipts": total_records,
        "total_volume": round(float(total_volume), 2),
        "total_volume_formatted": f"₹{total_volume:,.2f}",
        "compliance_rate": f"{compliance_rate}%",
        "compliance_numeric": compliance_rate,
        "discrepancies_flagged": discrepancies_total,
        "flagged_fraud_count": flagged_fraud,
        "pending_review_count": pending_review,
        "verified_clean_count": verified_clean,
        "audit_accuracy": f"{accuracy}%",
        "accuracy_numeric": accuracy,
        "database_type": DB_TYPE.upper(),
        "recent_logs": [log.to_dict() for log in recent_logs],
    }


def init_db():
    """Initializes tables, ensures schema migrations, and seeds records."""
    Base.metadata.create_all(bind=engine)

    # Auto-migration for newly added columns like igst
    try:
        with engine.connect() as conn:
            if DB_TYPE == "mysql":
                res = conn.execute(text("SHOW COLUMNS FROM audit_records LIKE 'igst'")).fetchone()
                if not res:
                    conn.execute(text("ALTER TABLE audit_records ADD COLUMN igst FLOAT DEFAULT 0.0 AFTER sgst"))
                    conn.commit()
                    print("[AuditPulse DB] Migrated MySQL schema: added 'igst' column.")
            elif DB_TYPE == "sqlite":
                columns = [row[1] for row in conn.execute(text("PRAGMA table_info(audit_records)")).fetchall()]
                if "igst" not in columns:
                    conn.execute(text("ALTER TABLE audit_records ADD COLUMN igst FLOAT DEFAULT 0.0"))
                    conn.commit()
                    print("[AuditPulse DB] Migrated SQLite schema: added 'igst' column.")
    except Exception as mig_err:
        print(f"[AuditPulse DB] Migration check note: {mig_err}")

    with SessionLocal() as db:
        seed_initial_data(db)


try:
    init_db()
except Exception as e:
    print(f"[AuditPulse DB] Error initializing database: {e}")
