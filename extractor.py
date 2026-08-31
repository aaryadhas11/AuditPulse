import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

def get_ai_client():
    if API_KEY:
        return genai.Client(api_key=API_KEY)
    return None

def parse_receipt_image(image, client):
    prompt = """
    Extract all readable details from this receipt/bill image into this JSON format:
    {
        "merchant_name": "Store or Restaurant Name",
        "date": "Transaction Date or N/A",
        "currency": "₹",
        "subtotal": 0.0,
        "tax_amount": 0.0,
        "grand_total": 0.0,
        "items": [
            {"item_name": "Item Name", "quantity": 1, "price": 0.0}
        ]
    }
    Notes:
    - If taxes/VAT/GST are missing, set tax_amount to 0.0.
    - grand_total should be the final paid/payable bill amount. If not explicitly found, set it equal to the subtotal or sum of items.
    Return ONLY valid JSON.
    """
    
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[image, prompt],
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    return json.loads(response.text)