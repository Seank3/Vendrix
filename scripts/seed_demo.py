#!/usr/bin/env python3
"""
Vendrix demo seed — populates the Acme org with realistic data via the public API.

Requires the backend running on 127.0.0.1:8000. Idempotent-ish: skips entities
that already exist (products/orders are keyed by sku / channel+external_id).

Usage:  python scripts/seed_demo.py [base_url]
"""
import json
import sys
import urllib.request

BASE = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000").rstrip("/") + "/api/v1"

# Credentials for the seeded admin (password is reset via ORM by run_seed_admin.py)
ADMIN_EMAIL = "admin@vendrix.dev"
ADMIN_PASSWORD = "VendrixDemo!2026"


def req(method, path, body=None, token=None, expect=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    r = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(r) as resp:
            code = resp.status
            payload = json.loads(resp.read().decode() or "null")
    except urllib.error.HTTPError as e:
        code = e.code
        payload = e.read().decode()
    if expect and code not in expect:
        print(f"  ! {method} {path} -> {code}: {str(payload)[:200]}")
        return None
    return payload


def main():
    print(f"Seeding Vendrix demo data against {BASE}\n")

    # 1) Login as the seeded admin
    login = req("POST", "/auth/login/", {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, expect={200})
    if not login:
        print("Could not log in — run scripts/run_seed_admin.py first to set the admin password.")
        sys.exit(1)
    token = login["access"]
    print(f"Logged in as {ADMIN_EMAIL} ({login['user']['role']})")

    # 2) Products (skip existing skus)
    products = [
        {"sku": "SHEA-500",   "name": "Organic Shea Butter 500ml", "category": "Skincare",  "status": "active",
         "description": "Raw, unrefined shea butter sourced from Northern Uganda cooperatives.",
         "channel_pricing": [{"channel": "shopify", "currency": "USD", "price": "12.50"}]},
        {"sku": "ALOE-250",   "name": "Aloe Vera Gel 250ml", "category": "Skincare", "status": "active",
         "description": "Cold-pressed aloe gel with no added fragrance.",
         "channel_pricing": [{"channel": "shopify", "currency": "USD", "price": "8.00"}]},
        {"sku": "COCO-200",   "name": "Coconut Hair Oil 200ml", "category": "Haircare", "status": "active",
         "description": "Virgin coconut oil for deep-conditioning treatment.",
         "channel_pricing": [{"channel": "jumia", "currency": "USD", "price": "9.75"}]},
        {"sku": "SOAP-001",   "name": "African Black Soap Bar", "category": "Bath & Body", "status": "active",
         "description": "Traditional black soap with cocoa pod ash.",
         "channel_pricing": [{"channel": "shopify", "currency": "USD", "price": "4.50"}]},
        {"sku": "BAOBAB-30",  "name": "Baobab Face Serum 30ml", "category": "Skincare", "status": "draft",
         "description": "Vitamin-C rich serum from baobab fruit extract."},
        {"sku": "MORINGA-1K", "name": "Moringa Powder 1kg", "category": "Supplements", "status": "active",
         "description": "Dried moringa leaf powder, food-grade."},
    ]
    existing = {p["sku"]: p for p in req("GET", "/products/", token=token, expect={200}) or []}
    for p in products:
        if p["sku"] in existing:
            print(f"  = product {p['sku']} exists")
            continue
        created = req("POST", "/products/", p, token=token, expect={201})
        print(f"  + product {p['sku']} -> {created.get('id', '?')[:8] if created else 'FAILED'}")

    # 3) Inventory (idempotent via absolute set: use delta = target - current)
    levels = {l["sku"]: l for l in req("GET", "/inventory/", token=token, expect={200}) or []}
    targets = {"SHEA-500": 180, "ALOE-250": 64, "COCO-200": 6, "SOAP-001": 24, "BAOBAB-30": 0, "MORINGA-1K": 75}
    for sku, target in targets.items():
        current = levels.get(sku, {}).get("quantity_on_hand", 0)
        delta = target - current
        if delta == 0:
            print(f"  = stock {sku} already {target}")
            continue
        r = req("POST", "/inventory/adjust/", {"sku": sku, "quantity_delta": delta, "notes": "Initial stock"},
                token=token, expect={200})
        print(f"  + stock {sku} {current} -> {target} ({'ok' if r else 'FAILED'})")

    # 4) Integrations (mock connectors authenticate successfully)
    intgs = {i["platform"]: i for i in req("GET", "/integrations/", token=token, expect={200}) or []}
    if "shopify" not in intgs:
        r = req("POST", "/integrations/", {"platform": "shopify", "name": "Shopify Store",
                                           "credentials": {"shop_url": "akira-beauty.myshopify.com",
                                                           "access_token": "shpat_demo_token"}}, token=token, expect={201})
        print(f"  + integration shopify -> {r.get('status') if r else 'FAILED'}")
    else:
        print("  = integration shopify exists")
    if "jumia" not in intgs:
        r = req("POST", "/integrations/", {"platform": "jumia", "name": "Jumia Vendor",
                                           "credentials": {"store_id": "VN-88231", "api_key": "jumia_demo_key"}},
                token=token, expect={201})
        print(f"  + integration jumia -> {r.get('status') if r else 'FAILED'}")
    else:
        print("  = integration jumia exists")
    if "etsy" not in intgs:
        r = req("POST", "/integrations/", {"platform": "etsy", "name": "Etsy Handmade",
                                           "credentials": {"api_key": "etsy_demo_key", "secret": "etsy_demo_secret"}},
                token=token, expect={201})
        print(f"  + integration etsy -> {r.get('status') if r else 'FAILED'}")
    else:
        print("  = integration etsy exists")

    # 5) Orders (idempotent per channel+external_id)
    shop_int = intgs.get("shopify", {}).get("id") or next(
        (i["id"] for i in req("GET", "/integrations/", token=token, expect={200}) or [] if i["platform"] == "shopify"), None)
    orders = [
        {"channel": "shopify", "external_id": "2001",
         "customer": {"name": "Jane Wanjiru", "email": "jane@example.com"},
         "line_items": [{"sku": "SHEA-500", "quantity": 2, "unit_price": "12.50", "name": "Organic Shea Butter 500ml"},
                        {"sku": "ALOE-250", "quantity": 1, "unit_price": "8.00", "name": "Aloe Vera Gel 250ml"}]},
        {"channel": "shopify", "external_id": "2002",
         "customer": {"name": "Kwame Osei", "email": "kwame@example.com"},
         "line_items": [{"sku": "SOAP-001", "quantity": 4, "unit_price": "4.50", "name": "African Black Soap Bar"},
                        {"sku": "MORINGA-1K", "quantity": 1, "unit_price": "18.00", "name": "Moringa Powder 1kg"}]},
        {"channel": "jumia", "external_id": "JUM-2201",
         "customer": {"name": "Amina Ssemwanga", "email": "amina@example.com"},
         "line_items": [{"sku": "COCO-200", "quantity": 2, "unit_price": "9.75", "name": "Coconut Hair Oil 200ml"}]},
        {"channel": "etsy", "external_id": "ETSY-881",
         "customer": {"name": "Lena Fischer", "email": "lena@example.com"},
         "line_items": [{"sku": "SHEA-500", "quantity": 3, "unit_price": "13.25", "name": "Organic Shea Butter 500ml"}]},
    ]
    for o in orders:
        r = req("POST", "/orders/", {**o, "integration_id": shop_int}, token=token, expect={201})
        print(f"  + order {o['channel']}/{o['external_id']} -> {'ok' if r else 'exists or failed'}")

    # 6) A couple of completed sync jobs (product push to shopify)
    products = req("GET", "/products/", token=token, expect={200}) or []
    if shop_int:
        job_count = req("GET", "/integrations/sync-jobs/", token=token, expect={200}) or []
        pushed = {j["resource_id"] for j in job_count if j["job_type"] == "product_push" and j["status"] == "completed"}
        for p in products[:2]:
            if p["id"] in pushed:
                continue
            r = req("POST", f"/integrations/{shop_int}/push-product/", {"product_id": p["id"]}, token=token, expect={202})
            status = r.get("status") if r else "FAILED"
            print(f"  + push {p['sku']} -> {status}")

    print("\nSeed complete. Login with a@a.com / VendrixDemo!2026 (or admin@vendrix.dev / VendrixDemo!2026).")


if __name__ == "__main__":
    main()
