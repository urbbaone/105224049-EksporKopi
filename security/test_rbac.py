#!/usr/bin/env python3
"""
Test Suite Otorisasi & Access Control (RBAC) - Tugas 2
Memverifikasi 10 kasus uji (5 Positif, 5 Negatif) sesuai matriks laporan.
"""

import sys

# Definisi Request Handler Mock / Controller
def handle_request(method: str, path: str, user=None):
    """
    Simulasi routing & middleware autorisasi berbasis RBAC
    user: dict(role="guest"|"user"|"moderator"|"admin", uid=str) atau None
    """
    # 1. Public Endpoints
    if path in ["/api/v1/health", "/api/v1/products"] and method == "GET":
        return 200, "OK"

    # 2. Butuh Autentikasi
    if not user or user.get("role") == "guest":
        return 401, "Unauthorized"

    role = user.get("role")
    uid = user.get("uid")

    # 3. Guard: Aksi terlarang sistem (bahkan admin dilarang menjalankan raw SQL sembarangan)
    if path == "/api/v1/admin/system/execute-raw-sql":
        return 403, "Forbidden: Dangerous raw SQL execution is disabled"

    # 4. User Profile (IDOR Check)
    if path.startswith("/api/v1/user/profile/"):
        target_id = path.replace("/api/v1/user/profile/", "")
        if target_id == "me" or target_id == uid:
            return 200, {"uid": uid, "name": "Profile Owner"}
        # Moderator & Admin boleh lihat profil orang lain
        if role in ["moderator", "admin"]:
            return 200, {"uid": target_id, "name": "Viewed by Staff"}
        return 403, "Forbidden: Cannot access other user profile"

    # 5. Orders & Checkout
    if path == "/api/v1/orders" and method == "POST":
        return 201, "Order Created"

    if path == "/api/v1/cart/checkout" and method == "POST":
        return 201, "Checkout Successful"

    # 6. Moderation Endpoints
    if path.startswith("/api/v1/moderation/"):
        if role not in ["moderator", "admin"]:
            return 403, "Forbidden: Staff role required"
        return 200, "Moderation Success"

    # 7. Admin Endpoints
    if path.startswith("/api/v1/admin/"):
        if role != "admin":
            return 403, "Forbidden: Administrator privileges required"
        return 200, "Admin Action Success"

    return 404, "Not Found"


def run_tests():
    print("=" * 65)
    print(" MENJALANKAN PENGUJIAN OTORISASI (RBAC) - TUGAS 2")
    print("=" * 65)

    test_cases = [
        # POSITIF
        {
            "id": "TC-POS-01",
            "type": "Positif",
            "role": "Guest",
            "user": None,
            "method": "GET",
            "path": "/api/v1/health",
            "expected": 200,
        },
        # NEGATIF
        {
            "id": "TC-NEG-01",
            "type": "Negatif",
            "role": "Guest",
            "user": None,
            "method": "POST",
            "path": "/api/v1/orders",
            "expected": 401,
        },
        # POSITIF
        {
            "id": "TC-POS-02",
            "type": "Positif",
            "role": "User",
            "user": {"role": "user", "uid": "test_user_01"},
            "method": "GET",
            "path": "/api/v1/user/profile/me",
            "expected": 200,
        },
        # NEGATIF
        {
            "id": "TC-NEG-02",
            "type": "Negatif",
            "role": "User",
            "user": {"role": "user", "uid": "test_user_01"},
            "method": "GET",
            "path": "/api/v1/user/profile/other_user_99",
            "expected": 403,
        },
        # POSITIF
        {
            "id": "TC-POS-03",
            "type": "Positif",
            "role": "User",
            "user": {"role": "user", "uid": "test_user_01"},
            "method": "POST",
            "path": "/api/v1/cart/checkout",
            "expected": 201,
        },
        # NEGATIF
        {
            "id": "TC-NEG-03",
            "type": "Negatif",
            "role": "User",
            "user": {"role": "user", "uid": "test_user_01"},
            "method": "GET",
            "path": "/api/v1/moderation/pending-queue",
            "expected": 403,
        },
        # POSITIF
        {
            "id": "TC-POS-04",
            "type": "Positif",
            "role": "Moderator",
            "user": {"role": "moderator", "uid": "test_mod_01"},
            "method": "PATCH",
            "path": "/api/v1/moderation/items/101/review",
            "expected": 200,
        },
        # NEGATIF
        {
            "id": "TC-NEG-04",
            "type": "Negatif",
            "role": "Moderator",
            "user": {"role": "moderator", "uid": "test_mod_01"},
            "method": "POST",
            "path": "/api/v1/admin/system/backup",
            "expected": 403,
        },
        # POSITIF
        {
            "id": "TC-POS-05",
            "type": "Positif",
            "role": "Admin",
            "user": {"role": "admin", "uid": "test_admin_01"},
            "method": "GET",
            "path": "/api/v1/admin/audit-logs",
            "expected": 200,
        },
        # NEGATIF
        {
            "id": "TC-NEG-05",
            "type": "Negatif",
            "role": "Admin",
            "user": {"role": "admin", "uid": "test_admin_01"},
            "method": "POST",
            "path": "/api/v1/admin/system/execute-raw-sql",
            "expected": 403,
        },
    ]

    all_passed = True
    pos_count = 0
    neg_count = 0

    for tc in test_cases:
        status_code, _ = handle_request(tc["method"], tc["path"], tc["user"])
        is_pass = status_code == tc["expected"]

        if tc["type"] == "Positif":
            pos_count += 1
        else:
            neg_count += 1

        status_str = "PASS [OK]" if is_pass else "FAIL [X]"
        print(f"[{status_str}] {tc['id']} ({tc['type']}) - Peran: {tc['role']:<10} -> {tc['method']} {tc['path']}")
        print(f"        Expected: {tc['expected']} | Actual: {status_code}")

        if not is_pass:
            all_passed = False

    print("=" * 65)
    print(f"Total Skenario: {len(test_cases)} ({pos_count} Uji Positif, {neg_count} Uji Negatif)")
    if all_passed:
        print("HASIL EVALUASI: SEMUA UJI RBAC LULUS 100% (Memenuhi Kriteria 1)")
    else:
        print("HASIL EVALUASI: ADA PENGUJIAN GAGAL")
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
