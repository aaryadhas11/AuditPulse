import os
import sys
import json
import unittest
from datetime import datetime

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient

from auditor import (
    validate_gstin,
    validate_gstin_detailed,
    get_gstin_state,
    evaluate_corporate_policies,
    evaluate_section_17_5_blocked_credits,
    run_comprehensive_audit
)
from vector_store import (
    CorporatePolicyVectorStore,
    InMemoryVectorAuditStore,
    policy_vector_store
)
from database import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
    calculate_confidence_score,
    get_dashboard_stats,
    SessionLocal,
    AuditRecord,
    AdminUser
)
from app import app


class TestGSTTaxAuditor(unittest.TestCase):
    """Forensic verification tests for Indian GST statutory rules and math reconciliation."""

    def test_gstin_validation(self):
        # Valid Maharashtra GSTIN
        self.assertTrue(validate_gstin("27AAKCS3053N1ZW"))
        is_valid, state = validate_gstin_detailed("27AAKCS3053N1ZW")
        self.assertTrue(is_valid)
        self.assertEqual(state, "Maharashtra")

        # Valid Delhi GSTIN
        is_valid_delhi, state_delhi = validate_gstin_detailed("07AABCI1234F1Z1")
        self.assertTrue(is_valid_delhi)
        self.assertEqual(state_delhi, "Delhi")

        # Invalid State Code (99 is not a registered state code)
        is_valid_bad_state, reason = validate_gstin_detailed("99AAKCS3053N1ZW")
        self.assertFalse(is_valid_bad_state)
        self.assertIn("Unrecognized state code", reason)

        # Malformed GSTIN (Wrong character length / syntax)
        self.assertFalse(validate_gstin("INVALID_GSTIN"))
        self.assertFalse(validate_gstin("N/A"))
        self.assertFalse(validate_gstin(""))

    def test_math_reconciliation_exact_and_tolerance(self):
        # 1. Exact match with tax
        data_clean = {
            "merchant_name": "Test Dining",
            "gstin": "27AAKCS3053N1ZW",
            "subtotal": 1000.0,
            "tax_amount": 50.0,
            "grand_total": 1050.0,
            "items": [{"item_name": "Lunch Buffet", "quantity": 1, "price": 1000.0}],
            "expense_category": "Food & Dining"
        }
        res = run_comprehensive_audit(data_clean)
        self.assertTrue(res["math_valid"])
        self.assertEqual(res["verdict"], "APPROVED")

        # 2. Rounding tolerance within ₹2.00 (CGST Act Section 170)
        data_rounded = {
            "merchant_name": "Test Store",
            "gstin": "27AAKCS3053N1ZW",
            "subtotal": 99.40,
            "tax_amount": 0.0,
            "grand_total": 100.0,
            "items": [{"item_name": "Stationery", "quantity": 1, "price": 99.40}],
            "expense_category": "Office Supplies"
        }
        res_rounded = run_comprehensive_audit(data_rounded)
        self.assertTrue(res_rounded["math_valid"])

        # 3. Arithmetic Discrepancy / Tampered Bill
        data_tampered = {
            "merchant_name": "Manipulated Vendor",
            "gstin": "27AAKCS3053N1ZW",
            "subtotal": 1000.0,
            "tax_amount": 50.0,
            "grand_total": 1400.0,  # ₹350 discrepancy
            "items": [{"item_name": "Meal", "quantity": 1, "price": 1000.0}],
            "expense_category": "Food & Dining"
        }
        res_tampered = run_comprehensive_audit(data_tampered)
        self.assertFalse(res_tampered["math_valid"])
        self.assertGreater(res_tampered["discrepancy_amount"], 0)
        self.assertIn(res_tampered["verdict"], ["MANUAL_REVIEW", "REJECTED"])

    def test_section_17_5_blocked_credits(self):
        # Alcohol disallowance under CGST Act Section 9(1) & 17(5)
        items_alcohol = [
            {"item_name": "Grilled Fish", "quantity": 1, "price": 600.0},
            {"item_name": "Draught Beer 500ml", "quantity": 2, "price": 800.0}
        ]
        flags = evaluate_corporate_policies({"items": items_alcohol, "grand_total": 1400.0, "expense_category": "Dining"})
        self.assertTrue(any("alcohol" in f.lower() for f in flags))

        blocked = evaluate_section_17_5_blocked_credits(items_alcohol, "Food & Dining")
        self.assertTrue(any("§17(5)" in b for b in blocked))


class TestPolicyVectorStore(unittest.TestCase):
    """Verification for Hybrid RAG semantic retrieval and vector deduplication."""

    def test_hybrid_policy_retrieval(self):
        # Query for dining and alcohol
        results = policy_vector_store.search_policies("client team dining per head alcohol limit", top_k=2)
        self.assertTrue(len(results) > 0)
        # Should rank Clause 4.2 high
        clause_codes = [r["clause_code"] for r in results]
        self.assertIn("Clause 4.2", clause_codes)
        self.assertGreaterEqual(results[0]["similarity"], 0.70)

        # Query for flight class
        results_flight = policy_vector_store.search_policies("commercial air travel domestic economy flight class", top_k=2)
        clause_codes_flight = [r["clause_code"] for r in results_flight]
        self.assertIn("Clause 6.1", clause_codes_flight)

    def test_vector_duplicate_detection(self):
        store = InMemoryVectorAuditStore()
        dummy_vec_1 = [0.1] * 64
        store.add_record("REC-001", {"vendor": "Taj"}, dummy_vec_1)

        # Same or very close embedding triggers duplicate
        match, sim = store.check_duplicate(dummy_vec_1, threshold=0.92)
        self.assertIsNotNone(match)
        self.assertEqual(match["id"], "REC-001")
        self.assertGreaterEqual(sim, 0.99)

        # Orthogonal/different embedding does not match
        different_vec = [-0.1 if i % 2 == 0 else 0.1 for i in range(64)]
        diff_match, diff_sim = store.check_duplicate(different_vec, threshold=0.92)
        self.assertIsNone(diff_match)


class TestDatabaseAndSecurity(unittest.TestCase):
    """Verification for bcrypt security, JWT claims, and dashboard stats."""

    def test_password_hashing_and_jwt(self):
        plain = "test_verification_pass_xyz"
        hashed = hash_password(plain)
        self.assertNotEqual(plain, hashed)
        self.assertTrue(verify_password(plain, hashed))
        self.assertFalse(verify_password("WrongPassword", hashed))

        token = create_access_token({"sub": "admin", "role": "admin"})
        payload = decode_access_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["sub"], "admin")
        self.assertEqual(payload["role"], "admin")
        self.assertIn("exp", payload)

    def test_confidence_score_bounds(self):
        perfect_data = {
            "merchant_name": "Valid Merchant Pvt Ltd",
            "date": "2026-10-29",
            "gstin": "27AAKCS3053N1ZW",
            "items": [{"item_name": "Item A", "price": 500.0, "quantity": 1}]
        }
        score = calculate_confidence_score(perfect_data, {"math_valid": True, "gstin_valid": True})
        self.assertGreaterEqual(score, 80.0)
        self.assertLessEqual(score, 99.4)

    def test_dashboard_stats_aggregation(self):
        with SessionLocal() as db:
            stats = get_dashboard_stats(db)
            self.assertIn("total_receipts", stats)
            self.assertIn("compliance_rate", stats)
            self.assertIn("total_volume", stats)
            self.assertIn("audit_accuracy", stats)
            self.assertIsInstance(stats["total_receipts"], int)


class TestFastAPIIntegration(unittest.TestCase):
    """End-to-end integration tests for FastAPI REST API endpoints."""

    def setUp(self):
        self.client = TestClient(app)

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertEqual(body["status"], "healthy")
        self.assertEqual(body["database"], "connected")

    def test_stats_endpoint(self):
        res = self.client.get("/api/stats")
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertIn("compliance_rate", body)
        self.assertIn("database_type", body)

    def test_policy_check_endpoint(self):
        payload = {
            "category": "flight",
            "expense_category": "Travel",
            "grand_total": 7770.0,
            "items": [{"item_name": "DEL to BOM Airfare", "price": 7400.0, "quantity": 1}]
        }
        res = self.client.post("/api/policy-check", json=payload)
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertIn("policy", body)
        self.assertEqual(body["policy"]["code"], "Clause 6.1")

    def test_chat_ca_assistant_endpoint(self):
        payload = {
            "question": "Can we claim GST ITC on this ₹1,480 dining bill?",
            "receipt_context": {"vendor": "Barbeque Nation", "total": 1480.0}
        }
        res = self.client.post("/api/chat", json=payload)
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertIn("answer", body)
        self.assertIn("sources", body)

    def test_rbac_security_barrier(self):
        # 1. Unauthenticated request to admin logs must return HTTP 401
        res_unauth = self.client.get("/api/admin/audit-logs")
        self.assertEqual(res_unauth.status_code, 401)

        # 2. Login with valid admin credentials (configured dynamically via secrets/environment)
        admin_user = os.getenv("ADMIN_USERNAME", "admin")
        admin_pass = os.getenv("ADMIN_PASSWORD", "admin")
        res_login = self.client.post("/api/auth/login", json={"username": admin_user, "password": admin_pass})
        self.assertEqual(res_login.status_code, 200)
        token = res_login.json()["access_token"]

        # 3. Authenticated request with JWT bearer token must return HTTP 200
        res_auth = self.client.get("/api/admin/audit-logs", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(res_auth.status_code, 200)
        self.assertIn("records", res_auth.json())


if __name__ == "__main__":
    unittest.main()
