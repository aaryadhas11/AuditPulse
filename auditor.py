import pandas as pd

def audit_bill_math(data):
    """
    Safely reconciles any receipt structure:
    Handles simple bills, GST/VAT bills, and missing fields dynamically.
    """
    items = data.get("items") or []
    
    # Safely convert extracted values to float
    try:
        grand_total = float(data.get("grand_total") or 0.0)
    except (ValueError, TypeError):
        grand_total = 0.0
        
    try:
        tax = float(data.get("tax_amount") or 0.0)
    except (ValueError, TypeError):
        tax = 0.0

    try:
        subtotal = float(data.get("subtotal") or 0.0)
    except (ValueError, TypeError):
        subtotal = 0.0

    # Calculate sum from individual line items
    computed_sum = 0.0
    for it in items:
        try:
            p = float(it.get("price") or 0.0)
            q = float(it.get("quantity") or 1.0)
            computed_sum += (p * q)
        except (ValueError, TypeError):
            continue

    # Determine final bill total to display
    final_total = grand_total if grand_total > 0 else (subtotal if subtotal > 0 else computed_sum)

    # Verification Logic
    # Case 1: Pure line-item match (No taxes or taxes already included)
    if abs(final_total - computed_sum) <= 2.0:
        return True, computed_sum, tax, final_total, f"Audit Verified: Item total (₹{computed_sum:.2f}) matches the final bill."
    
    # Case 2: Subtotal + Tax match (GST/VAT/Service charge added at the end)
    elif abs(final_total - (computed_sum + tax)) <= 2.0 or abs(final_total - (subtotal + tax)) <= 2.0:
        return True, computed_sum, tax, final_total, f"Audit Verified: Items (₹{computed_sum:.2f}) + Taxes (₹{tax:.2f}) balance with final bill (₹{final_total:.2f})."
    
    # Case 3: Line items match the printed Gross Subtotal
    elif subtotal > 0 and abs(subtotal - computed_sum) <= 2.0:
        return True, computed_sum, tax, final_total, f"Audit Verified: Line items match Gross Total (₹{computed_sum:.2f}). Final bill with taxes/charges is ₹{final_total:.2f}."
    
    # Discrepancy
    else:
        diff = abs(final_total - (computed_sum + tax))
        return False, computed_sum, tax, final_total, f"Calculation Discrepancy: Items (₹{computed_sum:.2f}) + Tax (₹{tax:.2f}) differs from stated total (₹{final_total:.2f}) by ₹{diff:.2f}."

def format_items_dataframe(items):
    if not items:
        return pd.DataFrame()
    df = pd.DataFrame(items)
    df.columns = [col.replace("_", " ").title() for col in df.columns]
    return df