import os
import io
import json
import datetime
from PIL import Image
import pandas as pd
import streamlit as st

from database import (
    SessionLocal,
    AuditRecord,
    AdminUser,
    get_dashboard_stats,
    verify_password,
    calculate_confidence_score,
    DB_TYPE
)
from extractor import (
    get_ai_client,
    parse_receipt_image,
    generate_receipt_embedding,
    fallback_heuristic_extraction
)
from auditor import (
    run_comprehensive_audit,
    validate_gstin_detailed,
    format_items_dataframe
)
from vector_store import policy_vector_store, audit_vector_memory

# Page Configuration
st.set_page_config(
    page_title="AuditPulse — Smart Expense & GST Auditor",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Enterprise CSS Styling (FinTech Ramp / Brex aesthetic)
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    html, body, [class*="css"] {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .main-header {
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        padding: 24px 32px;
        border-radius: 12px;
        color: white;
        margin-bottom: 24px;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.15);
    }
    .main-header h1 {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        letter-spacing: -0.5px;
    }
    .main-header p {
        margin: 6px 0 0 0;
        font-size: 14px;
        color: #94a3b8;
    }
    
    .metric-card {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 18px 20px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        margin-bottom: 12px;
    }
    .metric-title {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #64748b;
    }
    .metric-value {
        font-size: 26px;
        font-weight: 700;
        color: #0f172a;
        margin: 4px 0;
    }
    .metric-detail {
        font-size: 12px;
        color: #059669;
        font-weight: 500;
    }
    
    .status-badge-clean {
        background: #d1fae5;
        color: #065f46;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
    }
    .status-badge-review {
        background: #fef3c7;
        color: #92400e;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
    }
    .status-badge-fraud {
        background: #fee2e2;
        color: #991b1b;
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 12px;
        font-weight: 600;
        display: inline-block;
    }
</style>
""", unsafe_allow_html=True)

# Sidebar
with st.sidebar:
    st.image("https://img.icons8.com/fluency/96/shield.png", width=64)
    st.markdown("### **AuditPulse v2026.1**")
    st.markdown("Corporate Expense Intelligence & Indian GST Statutory Reconciliation.")
    
    st.divider()
    nav_option = st.radio(
        "Navigation",
        [
            "📊 Executive Dashboard",
            "🧾 Receipt Auditor & Ingestion",
            "🛡️ Policy RAG Knowledge Base",
            "💬 CA Statutory Tax Assistant",
            "🔐 Admin Database Portal"
        ]
    )
    
    st.divider()
    st.markdown(f"**Database:** `{DB_TYPE.upper()}`")
    st.markdown("**Compliance Engine:** `CGST Act §16/§17(5)`")
    st.markdown("**AI Vision:** `Gemini 2.5 Flash / Fallback`")

# -------------------------------------------------------------------------------------------------
# TAB 1: EXECUTIVE DASHBOARD
# -------------------------------------------------------------------------------------------------
if nav_option == "📊 Executive Dashboard":
    st.markdown("""
    <div class="main-header">
        <h1>Executive Compliance & Audit Dashboard</h1>
        <p>Live financial telemetry, statutory compliance rates, and fraud vector distribution.</p>
    </div>
    """, unsafe_allow_html=True)
    
    with SessionLocal() as db:
        stats = get_dashboard_stats(db)
        
    c1, c2, c3, c4 = st.columns(4)
    with c1:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Total Receipts Audited</div>
            <div class="metric-value">{stats['total_receipts']}</div>
            <div class="metric-detail">Database: {stats['database_type']}</div>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Total Expenditure Volume</div>
            <div class="metric-value">{stats.get('total_volume_formatted', '₹0.00')}</div>
            <div class="metric-detail">Audited Invoiced Sum</div>
        </div>
        """, unsafe_allow_html=True)
    with c3:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Policy Compliance Rate</div>
            <div class="metric-value">{stats['compliance_rate']}</div>
            <div class="metric-detail">{stats['verified_clean_count']} Clean · {stats['discrepancies_flagged']} Flagged</div>
        </div>
        """, unsafe_allow_html=True)
    with c4:
        st.markdown(f"""
        <div class="metric-card">
            <div class="metric-title">Mean Audit Accuracy</div>
            <div class="metric-value">{stats['audit_accuracy']}</div>
            <div class="metric-detail">OCR & Math Verification</div>
        </div>
        """, unsafe_allow_html=True)
        
    st.divider()
    st.subheader("📋 Recent Audit Activity")
    if stats['recent_logs']:
        df_logs = pd.DataFrame(stats['recent_logs'])
        display_cols = ["receipt_code", "employee_name", "department", "category", "vendor_name", "grand_total", "request_status", "confidence_score"]
        existing_cols = [c for c in display_cols if c in df_logs.columns]
        st.dataframe(df_logs[existing_cols], use_container_width=True, hide_index=True)
    else:
        st.info("No audit logs present yet. Upload a receipt in the 'Receipt Auditor' tab to begin.")

# -------------------------------------------------------------------------------------------------
# TAB 2: RECEIPT AUDITOR & INGESTION
# -------------------------------------------------------------------------------------------------
elif nav_option == "🧾 Receipt Auditor & Ingestion":
    st.markdown("""
    <div class="main-header">
        <h1>Receipt Intake & Multimodal Forensic Audit</h1>
        <p>Upload receipt images or PDF statements for automated OCR extraction, tax reconciliation, and corporate policy audit.</p>
    </div>
    """, unsafe_allow_html=True)

    col_left, col_right = st.columns([1, 1.2], gap="large")

    with col_left:
        st.subheader("1. Document Intake")
        uploaded_file = st.file_uploader("Upload Receipt Image or PDF", type=["jpg", "jpeg", "png", "webp", "pdf"])
        
        preview_image = None
        if uploaded_file is not None:
            if uploaded_file.type == "application/pdf":
                st.info("📄 PDF Document Loaded. Ready for multimodal processing.")
            else:
                preview_image = Image.open(uploaded_file)
                st.image(preview_image, caption=uploaded_file.name, use_container_width=True)
        else:
            st.info("💡 Tip: Upload a dining receipt, airline boarding pass, hotel folio, or cab receipt.")

    with col_right:
        st.subheader("2. Audit Execution & Analysis")
        
        if uploaded_file is not None:
            if st.button("🚀 Run Forensic Compliance Audit", type="primary", use_container_width=True):
                with st.spinner("Extracting parameters and reconciling GST against vector policy..."):
                    uploaded_file.seek(0)
                    file_bytes = uploaded_file.read()
                    
                    client = get_ai_client()
                    doc_id = str(int(datetime.datetime.utcnow().timestamp()))[-6:]
                    
                    if preview_image is not None:
                        input_doc = preview_image
                    else:
                        from google.genai import types as gtypes
                        input_doc = gtypes.Part.from_bytes(data=file_bytes, mime_type="application/pdf") if gtypes else file_bytes

                    extracted_data = parse_receipt_image(input_doc, client)
                    
                    # Run comprehensive audit
                    audit_res = run_comprehensive_audit(extracted_data)
                    
                    # Compute vector duplicate
                    emb = generate_receipt_embedding(extracted_data, client)
                    dup_match, dup_sim = audit_vector_memory.check_duplicate(emb)
                    if emb:
                        audit_vector_memory.add_record(doc_id, extracted_data, emb)

                    # Compute confidence
                    gstin_str = str(extracted_data.get("gstin") or "N/A")
                    gstin_valid, gstin_state = validate_gstin_detailed(gstin_str)
                    
                    confidence = calculate_confidence_score(extracted_data, {
                        "math_valid": audit_res["math_valid"],
                        "gstin_valid": gstin_valid
                    })

                    # Persist to database
                    with SessionLocal() as db:
                        try:
                            record = AuditRecord(
                                receipt_code=f"RCPT-{doc_id}",
                                employee_name="Aarya Dhas",
                                department="Engineering",
                                category=str(extracted_data.get("expense_category") or "dining").lower(),
                                submission_date=str(extracted_data.get("date") or "2026-10-29"),
                                request_status=audit_res["status_label"],
                                fraud_category="Arithmetic Manipulation" if not audit_res["math_valid"] else ("None" if audit_res["status_label"] == "Verified & Clean" else "Policy Cap Review"),
                                fraud_details="; ".join(audit_res["all_discrepancies"]) or "Compliant with corporate expenditure bylaws.",
                                vendor_name=str(extracted_data.get("merchant_name") or "Establishment"),
                                invoice_number=str(extracted_data.get("invoice_number") or f"INV-{doc_id}"),
                                gstin=gstin_str,
                                subtotal=float(extracted_data.get("subtotal") or 0.0),
                                cgst=float(extracted_data.get("cgst") or 0.0),
                                sgst=float(extracted_data.get("sgst") or 0.0),
                                igst=float(extracted_data.get("igst") or 0.0),
                                grand_total=float(extracted_data.get("grand_total") or 0.0),
                                confidence_score=confidence,
                                extracted_metadata=json.dumps(extracted_data),
                                audit_results=json.dumps(audit_res),
                            )
                            db.add(record)
                            db.commit()
                        except Exception as e:
                            db.rollback()
                            st.warning(f"Notice: Database persistence note: {e}")

                    # Render Results
                    st.success(f"Audit Complete! Verdict: **{audit_res['verdict']}** ({audit_res['status_label']})")
                    
                    m1, m2, m3 = st.columns(3)
                    m1.metric("Grand Total", f"₹{extracted_data.get('grand_total', 0.0):.2f}")
                    m2.metric("AI Confidence", f"{confidence}%")
                    m3.metric("State Jurisdiction", gstin_state)

                    st.markdown("#### 🔍 Reconciled Line Items")
                    items = extracted_data.get("items") or []
                    if items:
                        df_items = format_items_dataframe(items)
                        st.dataframe(df_items, use_container_width=True, hide_index=True)
                    else:
                        st.write("No itemized items detected.")

                    st.markdown("#### ⚖️ Compliance Findings & Flags")
                    if audit_res["all_discrepancies"]:
                        for disc in audit_res["all_discrepancies"]:
                            st.warning(f"⚠️ {disc}")
                    else:
                        st.info("✅ All line item calculations, statutory GSTIN, and corporate policy caps verified clean.")

                    if dup_match:
                        st.error(f"🚨 Duplicate Submission Detected! Matches record #{dup_match['id']} with {dup_sim*100:.1f}% vector similarity.")
        else:
            st.info("Upload a receipt on the left to begin the forensic audit.")

# -------------------------------------------------------------------------------------------------
# TAB 3: POLICY RAG KNOWLEDGE BASE
# -------------------------------------------------------------------------------------------------
elif nav_option == "🛡️ Policy RAG Knowledge Base":
    st.markdown("""
    <div class="main-header">
        <h1>Corporate Policy & Statutory RAG Knowledge Base</h1>
        <p>Semantic vector search across Global Corporate Travel & Expense Policy (v2026.1) and Indian CGST Act 2017 statutory bylaws.</p>
    </div>
    """, unsafe_allow_html=True)

    query = st.text_input("Enter policy query or clause number (e.g. 'flight business class limit', 'Clause 4.2', 'Section 17(5) alcohol')", "per head dining limit alcohol policy")
    category_filter = st.selectbox("Filter by Category", ["All Categories", "dining", "flight", "hotel", "cab", "statutory"])
    
    if st.button("🔍 Search Policy Vector Store"):
        filter_cat = None if category_filter == "All Categories" else category_filter
        citations = policy_vector_store.search_policies(query, top_k=4, category_filter=filter_cat)
        
        st.write(f"Found **{len(citations)}** relevant policy clauses:")
        for cit in citations:
            with st.expander(f"{cit['section']} — Similarity: {int(cit['similarity']*100)}%"):
                st.markdown(f"**Title:** {cit['title']}")
                st.markdown(f"**Bylaw Text:** {cit['text']}")
                st.caption(f"**Source Citation:** {cit['source']}")

# -------------------------------------------------------------------------------------------------
# TAB 4: CA STATUTORY TAX ASSISTANT
# -------------------------------------------------------------------------------------------------
elif nav_option == "💬 CA Statutory Tax Assistant":
    st.markdown("""
    <div class="main-header">
        <h1>Chartered Accountant (CA) & Senior Tax Auditor Assistant</h1>
        <p>Inquire about corporate expense reimbursement rules, Section 16 Input Tax Credit (ITC) eligibility, and Section 17(5) blocked credit rules under Indian CGST Act 2017.</p>
    </div>
    """, unsafe_allow_html=True)

    sample_questions = [
        "Can we claim GST ITC on this ₹1,480 restaurant meal bill?",
        "What is our corporate policy per-head limit under Clause 4.2?",
        "Why is input tax credit blocked on corporate client dining under Section 17(5)?",
        "What are the domestic air travel class restrictions under Clause 6.1?"
    ]
    
    selected_sample = st.selectbox("Quick Pre-configured Questions:", ["Custom Query..."] + sample_questions)
    
    default_q = selected_sample if selected_sample != "Custom Query..." else ""
    user_query = st.text_input("Ask the Tax Auditor:", value=default_q)

    if st.button("💬 Consult Auditor") and user_query:
        with st.spinner("Consulting statutory GST regulations and corporate bylaws..."):
            citations = policy_vector_store.search_policies(user_query, top_k=2)
            
            q_lower = user_query.lower()
            if any(k in q_lower for k in ["meal", "food", "dining", "restaurant", "17(5)", "blocked"]):
                answer = (
                    "**Statutory Tax Analysis under Section 17(5)(b)(i) of the CGST Act 2017:**\n\n"
                    "1. **Input Tax Credit (ITC) Eligibility:** Strictly **BLOCKED**. Under Section 17(5)(b)(i), ITC is legally "
                    "ineligible on food and beverages, outdoor catering, and club memberships.\n"
                    "2. **Corporate Policy Reimbursement (Clause 4.2):** Reimbursement is permitted for business dining up to "
                    "₹1,500.00 per attendee, provided alcohol is itemized and excluded. Total dining claims exceeding ₹2,500.00 "
                    "require manager pre-clearance.\n"
                    "3. **Audit Verdict:** Claim allowed for gross employee reimbursement, but GST paid cannot be set off against outward tax liability."
                )
            elif any(k in q_lower for k in ["flight", "airfare", "business class", "6.1"]):
                answer = (
                    "**Corporate Travel Policy Guidance under Clause 6.1 (Commercial Air Travel):**\n\n"
                    "1. **Cabin Class:** All domestic travel within India must be booked in **Economy Class**.\n"
                    "2. **Threshold:** Standard domestic sector airfares are capped at ₹8,500.00.\n"
                    "3. **Exceptions:** Business Class flights require written sign-off from the Department VP for flights exceeding 4 hours.\n"
                    "4. **Ancillary Fees:** Unapproved preferred seat fees and excess baggage are non-reimbursable."
                )
            else:
                answer = (
                    f"**Forensic Audit Analysis:**\n\n"
                    f"Based on the **Global Corporate Travel & Expense Policy (v2026.1)** and statutory Indian GST rules, "
                    f"invoices must carry a valid 15-character GSTIN, state code verification, and deterministic arithmetic reconciliation. "
                    f"Relevant policy clause: `{citations[0]['section']}`."
                )

            st.markdown("### 📋 Auditor's Formal Opinion:")
            st.markdown(answer)
            
            st.divider()
            st.caption(f"Cited Sources: {citations[0]['source']} | Section 16 & 17(5) CGST Act 2017")

# -------------------------------------------------------------------------------------------------
# TAB 5: ADMIN DATABASE PORTAL
# -------------------------------------------------------------------------------------------------
elif nav_option == "🔐 Admin Database Portal":
    st.markdown("""
    <div class="main-header">
        <h1>Administrative Database Gateway & Records Management</h1>
        <p>Restricted access portal for Chief Auditors, Finance Supervisors, and Database Administrators.</p>
    </div>
    """, unsafe_allow_html=True)

    if "admin_logged_in" not in st.session_state:
        st.session_state.admin_logged_in = False

    if not st.session_state.admin_logged_in:
        with st.form("admin_login_form"):
            st.subheader("Administrator Authentication")
            username = st.text_input("Username", value="", placeholder="Enter administrator username")
            password = st.text_input("Password", type="password", value="", placeholder="Enter password")
            submitted = st.form_submit_button("Sign In", type="primary")

            if submitted:
                with SessionLocal() as db:
                    admin_rec = db.query(AdminUser).filter(AdminUser.username == username.strip()).first()
                    if admin_rec and verify_password(password, admin_rec.password_hash):
                        st.session_state.admin_logged_in = True
                        st.session_state.admin_user = username
                        st.success(f"Authenticated as {username}!")
                        st.rerun()
                    else:
                        st.error("Invalid administrator credentials. Access denied.")
    else:
        st.write(f"Logged in as: **{st.session_state.get('admin_user')}**")
        if st.button("Log Out"):
            st.session_state.admin_logged_in = False
            st.rerun()

        st.divider()
        st.subheader("Audit Records Database")

        with SessionLocal() as db:
            filter_status = st.selectbox("Filter Status", ["All", "Verified & Clean", "Pending Supervisor Review", "Flagged as Fraud"])
            query = db.query(AuditRecord)
            if filter_status != "All":
                query = query.filter(AuditRecord.request_status == filter_status)
            records = query.order_by(AuditRecord.created_at.desc()).all()

            if records:
                data_dicts = [r.to_dict() for r in records]
                df_rec = pd.DataFrame(data_dicts)
                
                cols_to_show = ["id", "receipt_code", "employee_name", "department", "category", "vendor_name", "grand_total", "request_status", "confidence_score"]
                st.dataframe(df_rec[[c for c in cols_to_show if c in df_rec.columns]], use_container_width=True, hide_index=True)

                # Export CSV
                csv = df_rec.to_csv(index=False).encode('utf-8')
                st.download_button(
                    "📥 Export Audit Records (CSV)",
                    data=csv,
                    file_name=f"auditpulse_records_{datetime.datetime.utcnow().strftime('%Y%m%d')}.csv",
                    mime="text/csv",
                )
            else:
                st.info("No records match the current filter.")
