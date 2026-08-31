import streamlit as st
from PIL import Image
from extractor import get_ai_client, parse_receipt_image
from auditor import audit_bill_math, format_items_dataframe

st.set_page_config(page_title="AI Expense Auditor", page_icon="🧾", layout="wide")

st.title("🧾 Smart Receipt Auditor & Expense Tracker")
st.caption("AI Vision & Financial Reconciliation Pipeline")

client = get_ai_client()
uploaded_file = st.file_uploader("Upload Receipt / Bill Image", type=["jpg", "jpeg", "png"])

if uploaded_file:
    img = Image.open(uploaded_file)
    col1, col2 = st.columns([1, 1], gap="medium")
    
    with col1:
        st.subheader("Uploaded Receipt")
        st.image(img, use_container_width=True)
        
    with col2:
        st.subheader("Audit & Extraction Output")
        
        if st.button("Run Audit Pipeline", type="primary", use_container_width=True):
            if not client:
                st.error("Missing API key. Please check your .env file.")
            else:
                with st.spinner("Analyzing document and reconciling math..."):
                    try:
                        data = parse_receipt_image(img, client)
                        
                        # Run Defensive Audit
                        is_valid, items_sum, tax, final_total, audit_msg = audit_bill_math(data)
                        
                        # Top Metrics
                        c1, c2, c3, c4 = st.columns(4)
                        c1.metric("Merchant", data.get("merchant_name", "N/A"))
                        c2.metric("Date", data.get("date", "N/A"))
                        curr = data.get("currency", "₹")
                        c3.metric("Tax / GST", f"{curr} {tax:.2f}")
                        c4.metric("Grand Total", f"{curr} {final_total:.2f}")
                        
                        st.divider()
                        
                        # Render Audit Status
                        st.markdown("#### 🔍 Audit Status")
                        if is_valid:
                            st.success(f"✅ {audit_msg}")
                        else:
                            st.warning(f"⚠️ {audit_msg}")
                            
                        # Items Breakdown & Analytics
                        items = data.get("items", [])
                        if items:
                            df = format_items_dataframe(items)
                            st.markdown("#### 📋 Itemized Breakdown")
                            st.dataframe(df, use_container_width=True)
                            
                            st.markdown("#### 📊 Item-wise Cost Breakdown")
                            chart_df = df.set_index("Item Name")[["Price"]]
                            st.bar_chart(chart_df)
                            
                            csv_data = df.to_csv(index=False).encode('utf-8')
                            st.download_button(
                                label="📥 Export Verified CSV",
                                data=csv_data,
                                file_name="receipt_audit_report.csv",
                                mime="text/csv",
                                use_container_width=True
                            )
                    except Exception as err:
                        st.error(f"Execution Error: {err}")