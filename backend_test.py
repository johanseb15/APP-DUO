#!/usr/bin/env python3
"""
Backend API Testing for DUO Previa PWA
Tests all backend endpoints for the Argentine fast-food delivery app
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    base_url = line.split('=')[1].strip()
                    return f"{base_url}/api"
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BASE_URL = get_backend_url()
if not BASE_URL:
    print("❌ Could not determine backend URL from frontend/.env")
    sys.exit(1)

print(f"🔗 Testing backend at: {BASE_URL}")

# Test results tracking
test_results = {
    "passed": 0,
    "failed": 0,
    "errors": []
}

def log_test(test_name, success, details=""):
    """Log test results"""
    if success:
        print(f"✅ {test_name}")
        test_results["passed"] += 1
    else:
        print(f"❌ {test_name}: {details}")
        test_results["failed"] += 1
        test_results["errors"].append(f"{test_name}: {details}")

def test_initialize_data():
    """Test POST /api/initialize-data endpoint"""
    print("\n🧪 Testing Sample Data Initialization...")
    
    try:
        response = requests.post(f"{BASE_URL}/initialize-data", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if "message" in data:
                log_test("Initialize data endpoint", True, f"Response: {data['message']}")
                return True
            else:
                log_test("Initialize data endpoint", False, "Missing message in response")
                return False
        else:
            log_test("Initialize data endpoint", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Initialize data endpoint", False, f"Request failed: {str(e)}")
        return False

def test_menu_endpoints():
    """Test menu-related endpoints"""
    print("\n🧪 Testing Menu Endpoints...")
    
    # Test GET /api/menu
    try:
        response = requests.get(f"{BASE_URL}/menu", timeout=10)
        
        if response.status_code == 200:
            menu_items = response.json()
            if isinstance(menu_items, list) and len(menu_items) > 0:
                # Validate menu item structure
                first_item = menu_items[0]
                required_fields = ["id", "name", "description", "price", "category", "image_url", "available"]
                
                if all(field in first_item for field in required_fields):
                    log_test("GET /api/menu", True, f"Retrieved {len(menu_items)} menu items")
                    
                    # Test category filtering
                    categories = ["lomitos", "hamburgers", "empanadas"]
                    for category in categories:
                        try:
                            cat_response = requests.get(f"{BASE_URL}/menu/category/{category}", timeout=10)
                            if cat_response.status_code == 200:
                                cat_items = cat_response.json()
                                if isinstance(cat_items, list):
                                    # Verify all items belong to the category
                                    if all(item.get("category") == category for item in cat_items):
                                        log_test(f"GET /api/menu/category/{category}", True, f"Retrieved {len(cat_items)} {category} items")
                                    else:
                                        log_test(f"GET /api/menu/category/{category}", False, "Items don't match category filter")
                                else:
                                    log_test(f"GET /api/menu/category/{category}", False, "Response is not a list")
                            else:
                                log_test(f"GET /api/menu/category/{category}", False, f"Status {cat_response.status_code}")
                        except Exception as e:
                            log_test(f"GET /api/menu/category/{category}", False, f"Request failed: {str(e)}")
                    
                    return True
                else:
                    missing_fields = [field for field in required_fields if field not in first_item]
                    log_test("GET /api/menu", False, f"Missing required fields: {missing_fields}")
                    return False
            else:
                log_test("GET /api/menu", False, "Empty or invalid menu response")
                return False
        else:
            log_test("GET /api/menu", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("GET /api/menu", False, f"Request failed: {str(e)}")
        return False

def test_delivery_zones():
    """Test delivery zones endpoints"""
    print("\n🧪 Testing Delivery Zones Endpoints...")
    
    try:
        response = requests.get(f"{BASE_URL}/delivery-zones", timeout=10)
        
        if response.status_code == 200:
            zones = response.json()
            if isinstance(zones, list) and len(zones) > 0:
                # Validate zone structure
                first_zone = zones[0]
                required_fields = ["id", "name", "delivery_fee", "estimated_time", "active"]
                
                if all(field in first_zone for field in required_fields):
                    # Check for expected Córdoba zones
                    zone_names = [zone.get("name") for zone in zones]
                    expected_zones = ["Centro", "Nueva Córdoba", "Cerro de las Rosas", "Güemes"]
                    
                    found_zones = [zone for zone in expected_zones if zone in zone_names]
                    if len(found_zones) >= 3:  # At least 3 of the expected zones
                        log_test("GET /api/delivery-zones", True, f"Retrieved {len(zones)} zones including: {', '.join(found_zones)}")
                        return True
                    else:
                        log_test("GET /api/delivery-zones", False, f"Missing expected Córdoba zones. Found: {zone_names}")
                        return False
                else:
                    missing_fields = [field for field in required_fields if field not in first_zone]
                    log_test("GET /api/delivery-zones", False, f"Missing required fields: {missing_fields}")
                    return False
            else:
                log_test("GET /api/delivery-zones", False, "Empty or invalid zones response")
                return False
        else:
            log_test("GET /api/delivery-zones", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("GET /api/delivery-zones", False, f"Request failed: {str(e)}")
        return False

def test_order_creation():
    """Test order creation endpoint"""
    print("\n🧪 Testing Order Creation...")
    
    # First get menu items to create a realistic order
    try:
        menu_response = requests.get(f"{BASE_URL}/menu", timeout=10)
        if menu_response.status_code != 200:
            log_test("Order creation (prerequisite)", False, "Could not fetch menu items for order test")
            return False
            
        menu_items = menu_response.json()
        if not menu_items:
            log_test("Order creation (prerequisite)", False, "No menu items available for order test")
            return False
            
        # Create a sample order with realistic Argentine data
        sample_order = {
            "items": [
                {
                    "menu_item_id": menu_items[0]["id"],
                    "name": menu_items[0]["name"],
                    "price": menu_items[0]["price"],
                    "quantity": 2,
                    "special_instructions": "Sin cebolla por favor"
                }
            ],
            "total": menu_items[0]["price"] * 2 + 300,  # Including delivery fee
            "customer_name": "María González",
            "customer_phone": "+54 351 123-4567",
            "delivery_zone": "Centro",
            "delivery_address": "Av. Colón 123, Centro, Córdoba",
            "special_instructions": "Tocar timbre, departamento 4B"
        }
        
        # Test order creation
        response = requests.post(
            f"{BASE_URL}/orders",
            json=sample_order,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            order = response.json()
            required_fields = ["id", "items", "total", "customer_name", "customer_phone", 
                             "delivery_zone", "delivery_address", "status", "created_at"]
            
            if all(field in order for field in required_fields):
                # Validate order data
                if (order["customer_name"] == sample_order["customer_name"] and
                    order["total"] == sample_order["total"] and
                    len(order["items"]) == len(sample_order["items"]) and
                    order["status"] == "pending"):
                    
                    log_test("POST /api/orders", True, f"Order created with ID: {order['id']}")
                    return True
                else:
                    log_test("POST /api/orders", False, "Order data doesn't match input")
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in order]
                log_test("POST /api/orders", False, f"Missing required fields: {missing_fields}")
                return False
        else:
            log_test("POST /api/orders", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("POST /api/orders", False, f"Request failed: {str(e)}")
        return False

def run_all_tests():
    """Run all backend tests in the correct order"""
    print("🚀 Starting DUO Previa Backend API Tests")
    print("=" * 50)
    
    # Test in logical order
    success = True
    
    # 1. Initialize data first
    if not test_initialize_data():
        success = False
    
    # 2. Test menu endpoints
    if not test_menu_endpoints():
        success = False
    
    # 3. Test delivery zones
    if not test_delivery_zones():
        success = False
    
    # 4. Test order creation
    if not test_order_creation():
        success = False
    
    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"✅ Passed: {test_results['passed']}")
    print(f"❌ Failed: {test_results['failed']}")
    
    if test_results["errors"]:
        print("\n🔍 FAILED TESTS:")
        for error in test_results["errors"]:
            print(f"  • {error}")
    
    if success and test_results["failed"] == 0:
        print("\n🎉 All backend API tests passed!")
        return True
    else:
        print(f"\n⚠️  {test_results['failed']} test(s) failed")
        return False

if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)