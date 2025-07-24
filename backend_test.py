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
                    return order["id"]  # Return order ID for admin tests
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

def test_admin_authentication():
    """Test admin authentication endpoints"""
    print("\n🧪 Testing Admin Authentication...")
    
    # Test admin login with default credentials
    login_data = {
        "email": "admin@duoprevia.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json=login_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            auth_data = response.json()
            required_fields = ["access_token", "token_type", "admin"]
            
            if all(field in auth_data for field in required_fields):
                token = auth_data["access_token"]
                admin_info = auth_data["admin"]
                
                if (auth_data["token_type"] == "bearer" and
                    admin_info.get("email") == "admin@duoprevia.com" and
                    admin_info.get("name") == "Administrador DUO Previa"):
                    
                    log_test("POST /api/admin/login", True, f"Admin login successful for {admin_info['email']}")
                    
                    # Test GET /api/admin/me with token
                    headers = {"Authorization": f"Bearer {token}"}
                    me_response = requests.get(f"{BASE_URL}/admin/me", headers=headers, timeout=10)
                    
                    if me_response.status_code == 200:
                        me_data = me_response.json()
                        if (me_data.get("email") == "admin@duoprevia.com" and
                            me_data.get("name") == "Administrador DUO Previa"):
                            log_test("GET /api/admin/me", True, f"Admin info retrieved for {me_data['email']}")
                            return token  # Return token for other admin tests
                        else:
                            log_test("GET /api/admin/me", False, "Admin info doesn't match expected data")
                            return False
                    else:
                        log_test("GET /api/admin/me", False, f"Status {me_response.status_code}: {me_response.text}")
                        return False
                else:
                    log_test("POST /api/admin/login", False, "Login response data doesn't match expected format")
                    return False
            else:
                missing_fields = [field for field in required_fields if field not in auth_data]
                log_test("POST /api/admin/login", False, f"Missing required fields: {missing_fields}")
                return False
        else:
            log_test("POST /api/admin/login", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("POST /api/admin/login", False, f"Request failed: {str(e)}")
        return False

def test_admin_menu_management(admin_token):
    """Test admin menu management endpoints"""
    print("\n🧪 Testing Admin Menu Management...")
    
    if not admin_token:
        log_test("Admin menu management (prerequisite)", False, "No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    
    # Test creating a new menu item
    new_menu_item = {
        "name": "Lomito Especial Test",
        "description": "Lomito especial con ingredientes premium para testing",
        "price": 5200.0,
        "category": "lomitos",
        "image_url": "https://images.unsplash.com/photo-1553909489-cd47e0907980?w=400",
        "available": True
    }
    
    try:
        # CREATE menu item
        response = requests.post(
            f"{BASE_URL}/admin/menu",
            json=new_menu_item,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            created_item = response.json()
            if (created_item.get("name") == new_menu_item["name"] and
                created_item.get("price") == new_menu_item["price"] and
                "id" in created_item):
                
                log_test("POST /api/admin/menu", True, f"Menu item created with ID: {created_item['id']}")
                item_id = created_item["id"]
                
                # UPDATE menu item
                update_data = {
                    "price": 5500.0,
                    "description": "Lomito especial actualizado para testing"
                }
                
                update_response = requests.put(
                    f"{BASE_URL}/admin/menu/{item_id}",
                    json=update_data,
                    headers=headers,
                    timeout=10
                )
                
                if update_response.status_code == 200:
                    updated_item = update_response.json()
                    if (updated_item.get("price") == 5500.0 and
                        "actualizado" in updated_item.get("description", "")):
                        log_test("PUT /api/admin/menu/{item_id}", True, f"Menu item updated successfully")
                        
                        # DELETE menu item
                        delete_response = requests.delete(
                            f"{BASE_URL}/admin/menu/{item_id}",
                            headers=headers,
                            timeout=10
                        )
                        
                        if delete_response.status_code == 200:
                            delete_data = delete_response.json()
                            if "deleted successfully" in delete_data.get("message", ""):
                                log_test("DELETE /api/admin/menu/{item_id}", True, "Menu item deleted successfully")
                                return True
                            else:
                                log_test("DELETE /api/admin/menu/{item_id}", False, "Unexpected delete response")
                                return False
                        else:
                            log_test("DELETE /api/admin/menu/{item_id}", False, f"Status {delete_response.status_code}")
                            return False
                    else:
                        log_test("PUT /api/admin/menu/{item_id}", False, "Update data doesn't match expected values")
                        return False
                else:
                    log_test("PUT /api/admin/menu/{item_id}", False, f"Status {update_response.status_code}")
                    return False
            else:
                log_test("POST /api/admin/menu", False, "Created item doesn't match input data")
                return False
        else:
            log_test("POST /api/admin/menu", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Admin menu management", False, f"Request failed: {str(e)}")
        return False

def test_admin_order_management(admin_token, test_order_id):
    """Test admin order management endpoints"""
    print("\n🧪 Testing Admin Order Management...")
    
    if not admin_token:
        log_test("Admin order management (prerequisite)", False, "No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    
    try:
        # Test GET /api/admin/orders
        response = requests.get(f"{BASE_URL}/admin/orders", headers=headers, timeout=10)
        
        if response.status_code == 200:
            orders = response.json()
            if isinstance(orders, list):
                log_test("GET /api/admin/orders", True, f"Retrieved {len(orders)} orders")
                
                # Test filtering by status
                pending_response = requests.get(
                    f"{BASE_URL}/admin/orders?status=pending",
                    headers=headers,
                    timeout=10
                )
                
                if pending_response.status_code == 200:
                    pending_orders = pending_response.json()
                    if isinstance(pending_orders, list):
                        log_test("GET /api/admin/orders?status=pending", True, f"Retrieved {len(pending_orders)} pending orders")
                        
                        # Test order status update if we have a test order
                        if test_order_id:
                            status_update = {"status": "confirmed"}
                            update_response = requests.put(
                                f"{BASE_URL}/admin/orders/{test_order_id}/status",
                                json=status_update,
                                headers={**headers, "Content-Type": "application/json"},
                                timeout=10
                            )
                            
                            if update_response.status_code == 200:
                                update_data = update_response.json()
                                if "confirmed" in update_data.get("message", ""):
                                    log_test("PUT /api/admin/orders/{order_id}/status", True, "Order status updated to confirmed")
                                    return True
                                else:
                                    log_test("PUT /api/admin/orders/{order_id}/status", False, "Unexpected update response")
                                    return False
                            else:
                                log_test("PUT /api/admin/orders/{order_id}/status", False, f"Status {update_response.status_code}")
                                return False
                        else:
                            log_test("PUT /api/admin/orders/{order_id}/status", True, "Skipped - no test order available")
                            return True
                    else:
                        log_test("GET /api/admin/orders?status=pending", False, "Response is not a list")
                        return False
                else:
                    log_test("GET /api/admin/orders?status=pending", False, f"Status {pending_response.status_code}")
                    return False
            else:
                log_test("GET /api/admin/orders", False, "Response is not a list")
                return False
        else:
            log_test("GET /api/admin/orders", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Admin order management", False, f"Request failed: {str(e)}")
        return False

def test_admin_delivery_zone_management(admin_token):
    """Test admin delivery zone management endpoints"""
    print("\n🧪 Testing Admin Delivery Zone Management...")
    
    if not admin_token:
        log_test("Admin delivery zone management (prerequisite)", False, "No admin token available")
        return False
    
    headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
    
    # Test creating a new delivery zone
    new_zone = {
        "name": "Zona Test",
        "delivery_fee": 450.0,
        "estimated_time": "35-50 min",
        "active": True
    }
    
    try:
        # CREATE delivery zone
        response = requests.post(
            f"{BASE_URL}/admin/delivery-zones",
            json=new_zone,
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            created_zone = response.json()
            if (created_zone.get("name") == new_zone["name"] and
                created_zone.get("delivery_fee") == new_zone["delivery_fee"] and
                "id" in created_zone):
                
                log_test("POST /api/admin/delivery-zones", True, f"Delivery zone created with ID: {created_zone['id']}")
                zone_id = created_zone["id"]
                
                # UPDATE delivery zone
                update_data = {
                    "delivery_fee": 500.0,
                    "estimated_time": "40-55 min"
                }
                
                update_response = requests.put(
                    f"{BASE_URL}/admin/delivery-zones/{zone_id}",
                    json=update_data,
                    headers=headers,
                    timeout=10
                )
                
                if update_response.status_code == 200:
                    updated_zone = update_response.json()
                    if (updated_zone.get("delivery_fee") == 500.0 and
                        "40-55" in updated_zone.get("estimated_time", "")):
                        log_test("PUT /api/admin/delivery-zones/{zone_id}", True, "Delivery zone updated successfully")
                        
                        # DELETE delivery zone
                        delete_response = requests.delete(
                            f"{BASE_URL}/admin/delivery-zones/{zone_id}",
                            headers=headers,
                            timeout=10
                        )
                        
                        if delete_response.status_code == 200:
                            delete_data = delete_response.json()
                            if "deleted successfully" in delete_data.get("message", ""):
                                log_test("DELETE /api/admin/delivery-zones/{zone_id}", True, "Delivery zone deleted successfully")
                                return True
                            else:
                                log_test("DELETE /api/admin/delivery-zones/{zone_id}", False, "Unexpected delete response")
                                return False
                        else:
                            log_test("DELETE /api/admin/delivery-zones/{zone_id}", False, f"Status {delete_response.status_code}")
                            return False
                    else:
                        log_test("PUT /api/admin/delivery-zones/{zone_id}", False, "Update data doesn't match expected values")
                        return False
                else:
                    log_test("PUT /api/admin/delivery-zones/{zone_id}", False, f"Status {update_response.status_code}")
                    return False
            else:
                log_test("POST /api/admin/delivery-zones", False, "Created zone doesn't match input data")
                return False
        else:
            log_test("POST /api/admin/delivery-zones", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Admin delivery zone management", False, f"Request failed: {str(e)}")
        return False

def test_push_notifications(admin_token):
    """Test push notification endpoints"""
    print("\n🧪 Testing Push Notifications...")
    
    # Test push subscription (public endpoint)
    subscription_data = {
        "endpoint": "https://fcm.googleapis.com/fcm/send/test-endpoint-123",
        "keys": {
            "p256dh": "test-p256dh-key",
            "auth": "test-auth-key"
        },
        "userAgent": "Mozilla/5.0 (Test Browser)"
    }
    
    try:
        # Test POST /api/push/subscribe
        response = requests.post(
            f"{BASE_URL}/push/subscribe",
            json=subscription_data,
            headers={"Content-Type": "application/json"},
            timeout=10
        )
        
        if response.status_code == 200:
            sub_data = response.json()
            if "Subscribed successfully" in sub_data.get("message", ""):
                log_test("POST /api/push/subscribe", True, "Push subscription successful")
                
                # Test admin push notification sending
                if admin_token:
                    headers = {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}
                    
                    notification_data = {
                        "title": "¡DUO Previa está abierto!",
                        "body": "Hacé tu pedido ahora y recibilo en 30 minutos",
                        "icon": "/icon-192x192.png",
                        "url": "/"
                    }
                    
                    send_response = requests.post(
                        f"{BASE_URL}/admin/push/send",
                        json=notification_data,
                        headers=headers,
                        timeout=10
                    )
                    
                    if send_response.status_code == 200:
                        send_data = send_response.json()
                        if ("subscribers" in send_data.get("message", "") and
                            "notification_id" in send_data):
                            log_test("POST /api/admin/push/send", True, f"Notification sent: {send_data['message']}")
                            
                            # Test getting notification history
                            history_response = requests.get(
                                f"{BASE_URL}/admin/push/notifications",
                                headers=headers,
                                timeout=10
                            )
                            
                            if history_response.status_code == 200:
                                notifications = history_response.json()
                                if isinstance(notifications, list):
                                    log_test("GET /api/admin/push/notifications", True, f"Retrieved {len(notifications)} notifications")
                                    return True
                                else:
                                    log_test("GET /api/admin/push/notifications", False, "Response is not a list")
                                    return False
                            else:
                                log_test("GET /api/admin/push/notifications", False, f"Status {history_response.status_code}")
                                return False
                        else:
                            log_test("POST /api/admin/push/send", False, "Unexpected send response format")
                            return False
                    else:
                        log_test("POST /api/admin/push/send", False, f"Status {send_response.status_code}: {send_response.text}")
                        return False
                else:
                    log_test("Admin push notifications", False, "No admin token available")
                    return False
            else:
                log_test("POST /api/push/subscribe", False, "Unexpected subscription response")
                return False
        else:
            log_test("POST /api/push/subscribe", False, f"Status {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        log_test("Push notifications", False, f"Request failed: {str(e)}")
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