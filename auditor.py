import re
import datetime
from typing import Dict, List, Any, Tuple
import pandas as pd

# Official Indian GST State / Union Territory Codes
INDIAN_GST_STATE_CODES: Dict[str, str] = {
    "01": "Jammu and Kashmir",
    "02": "Himachal Pradesh",
    "03": "Punjab",
    "04": "Chandigarh",
    "05": "Uttarakhand",
    "06": "Haryana",
    "07": "Delhi",
    "08": "Rajasthan",
    "09": "Uttar Pradesh",
    "10": "Bihar",
    "11": "Sikkim",
    "12": "Arunachal Pradesh",
    "13": "Nagaland",
    "14": "Manipur",
    "15": "Mizoram",
    "16": "Tripura",
    "17": "Meghalaya",
    "18": "Assam",
    "19": "West Bengal",
    "20": "Jharkhand",
    "21": "Odisha",
    "22": "Chhattisgarh",
    "23": "Madhya Pradesh",
    "24": "Gujarat",
    "26": "Dadra and Nagar Haveli and Daman and Diu",
    "27": "Maharashtra",
    "29": "Karnataka",
    "30": "Goa",
    "31": "Lakshadweep",
    "32": "Kerala",
    "33": "Tamil Nadu",
    "34": "Puducherry",
    "35": "Andaman and Nicobar Islands",
    "36": "Telangana",
    "37": "Andhra Pradesh",
    "38": "Ladakh",
    "97": "Other Territory",
}

def validate_gstin_detailed(gstin: str) -> Tuple[bool, str]:
    """
    Validates 15-character Indian GSTIN format and authenticates state code jurisdiction.
    Returns (is_valid, state_name_or_reason).
    """
    if not gstin or gstin.strip().upper() in ("N/A", "NONE", ""):
        return False, "GSTIN not provided"

    clean_gst = gstin.strip().upper()
    gst_regex = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    if not re.match(gst_regex, clean_gst):
        return False, "Invalid alphanumeric structure (Expected 15 chars: 2 state + 10 PAN + 1 entity + 'Z' + checksum)"

    state_code = clean_gst[:2]
    if state_code not in INDIAN_GST_STATE_CODES:
        return False, f"Unrecognized state code '{state_code}' (Must be valid Indian state code 01-38 or 97)"

    return True, INDIAN_GST_STATE_CODES[state_code]

def validate_gstin(gstin: str) -> bool:
    """Validates 15-character Indian GSTIN format and returns boolean for backward compatibility."""
    valid, _ = validate_gstin_detailed(gstin)
    return valid

def get_gstin_state(gstin: str) -> str:
    """Returns the Indian state name corresponding to the GSTIN 2-digit state code, or 'Unknown'."""
    valid, state_name = validate_gstin_detailed(gstin)
    return state_name if valid else "Unknown"

def evaluate_section_17_5_blocked_credits(items: List[dict], category: str) -> List[str]:
    """
    Statutory verification under Section 17(5) of the CGST Act 2017:
    Flags categories where Input Tax Credit (ITC) is strictly blocked by law.
    """
    blocked_flags = []
    cat_lower = category.lower()

    # 1. Food and Beverages / Outdoor Catering (Section 17(5)(b)(i))
    if any(k in cat_lower for k in ["food", "dining", "restaurant", "catering", "meal"]):
        blocked_flags.append(
            "Statutory Notice [CGST Act §17(5)(b)(i)]: Input Tax Credit (ITC) is blocked on food and beverage expenses. "
            "Reimbursement allowed under corporate policy, but GST cannot be claimed as tax credit."
        )

    # 2. Alcoholic Liquor for Human Consumption (Section 9(1) & §17(5))
    alcohol_keywords = ["beer", "whiskey", "vodka", "cocktail", "liquor", "wine", "bar", "brewery", "draught", "rum", "gin"]
    for item in items:
        name = str(item.get("item_name") or "").lower()
        if any(bad in name for bad in alcohol_keywords):
            blocked_flags.append(
                f"Statutory Infraction [CGST Act §9(1)]: Alcoholic liquor '{item.get('item_name')}' is outside GST purview "
                "and strictly prohibited from corporate reimbursement under corporate policy §2.1."
            )

    # 3. Personal Grooming, Club Memberships & Fitness (Section 17(5)(b)(ii))
    personal_keywords = ["spa", "massage", "salon", "club membership", "gym", "fitness", "gift voucher"]
    for item in items:
        name = str(item.get("item_name") or "").lower()
        if any(bad in name for bad in personal_keywords):
            blocked_flags.append(
                f"Statutory Disallowance [CGST Act §17(5)(b)(ii)]: Personal service / grooming item '{item.get('item_name')}' "
                "is a blocked credit and non-reimbursable."
            )

    return blocked_flags

def evaluate_corporate_policies(data: dict) -> list:
    """
    Enforces corporate travel & expense governance rules:
    1. Prohibited items (alcohol, personal entertainment).
    2. Category thresholds (Air travel class, Hotel nightly tariffs, Dining per-head caps, Cab limits).
    3. Weekend/holiday submission alerts.
    """
    infractions = []
    items = data.get("items", []) or []
    category = str(data.get("expense_category") or "").lower()
    total = float(data.get("grand_total") or 0.0)

    # 1. Prohibited alcohol keywords
    alcohol_keywords = ["beer", "whiskey", "vodka", "cocktail", "liquor", "wine", "bar", "brewery", "draught"]
    for item in items:
        name = str(item.get("item_name", "")).lower()
        if any(bad in name for bad in alcohol_keywords):
            infractions.append(f"Policy Breach [Clause 2.1]: Non-reimbursable alcohol/entertainment item ('{item.get('item_name')}').")

    # 2. Dining Caps (Clause 4.2: ₹1,500/head or ₹2,500 single-meal)
    if "food" in category or "dining" in category or "restaurant" in category:
        if total > 2500.0:
            infractions.append(f"Policy Warning [Clause 4.2]: Dining expense (₹{total:.2f}) exceeds standard single-meal threshold of ₹2,500.00.")

        for item in items:
            name = str(item.get("item_name", "")).lower()
            qty = float(item.get("quantity") or 1.0)
            price = float(item.get("price") or 0.0)
            if ("buffet" in name or "lunch" in name or "covers" in name) and qty > 0:
                per_head = price / qty
                if per_head > 1500.0:
                    infractions.append(
                        f"Policy Discrepancy [Clause 4.2]: Per-head cost of ₹{per_head:.2f} exceeds corporate cap of ₹1,500.00/head for {int(qty)} covers."
                    )

    # 3. Flight Class Restrictions (Clause 6.1)
    if "flight" in category or "airline" in category or "travel" in category:
        text_blob = " ".join(str(it.get("item_name", "")).lower() for it in items)
        if "business class" in text_blob or "business" in category:
            infractions.append("Policy Exception [Clause 6.1]: Domestic flight booked in Business Class. Domestic travel must be Economy Class.")
        if total > 8500.0:
            infractions.append(f"Policy Warning [Clause 6.1]: Airfare (₹{total:.2f}) exceeds standard sector cap of ₹8,500.00 without VP pre-approval.")

    # 4. Hotel Nightly Tariffs (Clause 8.3)
    if "hotel" in category or "lodging" in category or "stay" in category:
        if total > 6500.0:
            infractions.append(f"Policy Review [Clause 8.3]: Hotel lodging tariff (₹{total:.2f}) exceeds standard Tier-1 nightly cap of ₹6,500.00.")

    # 5. Cab & Commute Limits (Clause 3.1)
    if "cab" in category or "transit" in category or "fuel" in category:
        if total > 1800.0:
            infractions.append(f"Policy Warning [Clause 3.1]: Daily rideshare/cab claim (₹{total:.2f}) exceeds standard limit of ₹1,800.00.")

    # 6. Weekend Expense Review
    date_str = str(data.get("date", ""))
    for fmt in ("%Y-%m-%d", "%d/%m/%Y", "%d-%m-%Y", "%m/%d/%Y", "%d %b, %Y", "%d %b %Y"):
        try:
            parsed_date = datetime.datetime.strptime(date_str.strip(), fmt)
            if parsed_date.weekday() in (5, 6):
                infractions.append(f"Audit Flag [Clause 6.4]: Transaction occurred on a weekend ({parsed_date.strftime('%A')}). Requires manager sign-off.")
            break
        except ValueError:
            pass

    return infractions

def run_comprehensive_audit(data: dict) -> dict:
    """
    Executes forensic GST & arithmetic audit:
    - Deterministic math reconciliation
    - Indian GST statutory verification (State jurisdiction & Section 17(5))
    - Corporate policy enforcement
    - Risk scoring (0-100) and authoritative status verdict.
    """
    items = data.get("items") or []
    grand_total = float(data.get("grand_total") or 0.0)
    tax = float(data.get("tax_amount") or 0.0)
    subtotal = float(data.get("subtotal") or 0.0)
    category = str(data.get("expense_category") or "General")

    computed_sum = sum(float(it.get("price", 0.0)) * float(it.get("quantity", 1.0)) for it in items)
    final_total = grand_total if grand_total > 0 else (subtotal if subtotal > 0 else computed_sum)

    # 1. Math Reconciliation
    math_valid = False
    discrepancy_amount = 0.0

    # Tolerance within ₹2.00 (statutory rounding under Section 170 CGST Act)
    if abs(final_total - computed_sum) <= 2.0:
        # Tax-inclusive pricing
        math_valid = True
        math_msg = f"Reconciliation Verified: Line item sum (₹{computed_sum:.2f}) matches stated total within rounding tolerance."
    elif abs(final_total - (computed_sum + tax)) <= 2.0:
        math_valid = True
        math_msg = f"Reconciliation Verified: Item sum (₹{computed_sum:.2f}) + Tax (₹{tax:.2f}) equals total (₹{final_total:.2f})."
    elif abs(final_total - (subtotal + tax)) <= 2.0:
        math_valid = True
        math_msg = f"Reconciliation Verified: Subtotal (₹{subtotal:.2f}) + Tax (₹{tax:.2f}) equals total (₹{final_total:.2f})."
    else:
        discrepancy_amount = abs(final_total - (computed_sum + tax)) if computed_sum > 0 else abs(final_total - (subtotal + tax))
        math_msg = f"Arithmetic Discrepancy: Calculated sum (₹{computed_sum:.2f}) + Tax (₹{tax:.2f}) differs from stated total (₹{final_total:.2f}) by ₹{discrepancy_amount:.2f}."

    # 2. Statutory GSTIN Validation
    gstin = data.get("gstin", "N/A")
    gstin_valid, gstin_detail = validate_gstin_detailed(gstin)

    # 3. Policy Enforcement & Blocked Credit Check
    policy_flags = evaluate_corporate_policies(data)
    blocked_credits = evaluate_section_17_5_blocked_credits(items, category)
    all_discrepancies = list(policy_flags) + list(blocked_credits)
    if not math_valid:
        all_discrepancies.append(math_msg)
    if not gstin_valid and gstin != "N/A":
        all_discrepancies.append(f"GSTIN Format Warning: {gstin_detail}")

    # 4. Forensic Risk Scoring (0 to 100)
    risk_score = 5
    if not math_valid:
        risk_score += 45
    if not gstin_valid and gstin != "N/A":
        risk_score += 15
    risk_score += (len(policy_flags) * 15)
    risk_score += (len(blocked_credits) * 10)
    risk_score = min(max(risk_score, 0), 100)

    # Status Verdict
    if risk_score >= 60:
        verdict = "REJECTED"
        verdict_color = "red"
        status_label = "Flagged as Fraud"
    elif risk_score >= 30:
        verdict = "MANUAL_REVIEW"
        verdict_color = "orange"
        status_label = "Pending Supervisor Review"
    else:
        verdict = "APPROVED"
        verdict_color = "green"
        status_label = "Verified & Clean"

    return {
        "math_valid": math_valid,
        "math_msg": math_msg,
        "discrepancy_amount": round(discrepancy_amount, 2),
        "gstin_valid": gstin_valid,
        "gstin_state": gstin_detail if gstin_valid else "Unknown",
        "policy_flags": policy_flags,
        "blocked_credits": blocked_credits,
        "all_discrepancies": all_discrepancies,
        "risk_score": risk_score,
        "verdict": verdict,
        "verdict_color": verdict_color,
        "status_label": status_label,
        "computed_sum": round(computed_sum, 2),
        "final_total": round(final_total, 2),
        "tax": round(tax, 2)
    }

def format_items_dataframe(items: list) -> pd.DataFrame:
    """Formats extracted line items into a clean analytical DataFrame for UI/export."""
    if not items:
        return pd.DataFrame()
    df = pd.DataFrame(items)
    df.columns = [col.replace("_", " ").title() for col in df.columns]
    return df