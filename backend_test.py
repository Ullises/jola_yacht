import requests
import sys
import json
from datetime import datetime, timedelta

class JolaYachtAPITester:
    def __init__(self, base_url="https://yachtcancun.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.passed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                self.passed_tests.append(name)
                try:
                    return success, response.json() if response.content else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "response": response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n=== HEALTH CHECK TESTS ===")
        self.run_test("API Root", "GET", "", 200)
        self.run_test("Health Check", "GET", "health", 200)

    def test_public_endpoints(self):
        """Test public data endpoints"""
        print("\n=== PUBLIC ENDPOINTS TESTS ===")
        
        # Test experiences
        success, experiences = self.run_test("Get Experiences", "GET", "experiences", 200)
        if success and experiences:
            print(f"   Found {len(experiences)} experiences")
            if len(experiences) > 0:
                exp_id = experiences[0]['id']
                self.run_test("Get Single Experience", "GET", f"experiences/{exp_id}", 200)
        
        # Test fleet
        success, fleet = self.run_test("Get Fleet", "GET", "fleet", 200)
        if success and fleet:
            print(f"   Found {len(fleet)} fleet items")
            if len(fleet) > 0:
                fleet_id = fleet[0]['id']
                self.run_test("Get Single Fleet Item", "GET", f"fleet/{fleet_id}", 200)
        
        # Test reviews
        success, reviews = self.run_test("Get All Reviews", "GET", "reviews", 200)
        if success:
            print(f"   Found {len(reviews)} reviews")
        
        success, featured_reviews = self.run_test("Get Featured Reviews", "GET", "reviews/featured", 200)
        if success:
            print(f"   Found {len(featured_reviews)} featured reviews")
        
        # Test FAQs
        success, faqs = self.run_test("Get FAQs", "GET", "faqs", 200)
        if success:
            print(f"   Found {len(faqs)} FAQs")

    def test_availability(self):
        """Test availability endpoint"""
        print("\n=== AVAILABILITY TESTS ===")
        
        # Test with today's date
        today = datetime.now().strftime('%Y-%m-%d')
        success, availability = self.run_test("Get Today's Availability", "GET", f"availability/{today}", 200)
        if success and 'slots' in availability:
            print(f"   Found {len(availability['slots'])} time slots")
        
        # Test with future date
        future_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')
        self.run_test("Get Future Availability", "GET", f"availability/{future_date}", 200)

    def test_admin_login(self):
        """Test admin authentication"""
        print("\n=== ADMIN LOGIN TESTS ===")
        
        # Test with correct credentials
        login_data = {
            "email": "admin@jolayacht.com",
            "password": "JolaYacht2025!"
        }
        success, response = self.run_test("Admin Login", "POST", "auth/login", 200, login_data)
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        
        # Test with wrong credentials
        wrong_login = {
            "email": "wrong@email.com",
            "password": "wrongpassword"
        }
        self.run_test("Admin Login (Wrong Credentials)", "POST", "auth/login", 401, wrong_login)
        return False

    def test_admin_endpoints(self):
        """Test admin-protected endpoints"""
        if not self.token:
            print("\n❌ Skipping admin tests - no token available")
            return
        
        print("\n=== ADMIN ENDPOINTS TESTS ===")
        
        # Test admin stats
        self.run_test("Get Admin Stats", "GET", "admin/stats", 200)
        
        # Test admin reservations
        self.run_test("Get Admin Reservations", "GET", "admin/reservations", 200)

    def test_reservation_flow(self):
        """Test reservation creation flow"""
        print("\n=== RESERVATION FLOW TESTS ===")
        
        # First get an experience to book
        success, experiences = self.run_test("Get Experiences for Booking", "GET", "experiences", 200)
        if not success or not experiences:
            print("❌ Cannot test reservations - no experiences available")
            return
        
        exp_id = experiences[0]['id']
        
        # Create a reservation
        reservation_data = {
            "experience_id": exp_id,
            "customer_name": "Test Customer",
            "customer_email": "test@example.com",
            "customer_phone": "+52 998 123 4567",
            "date": (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d'),
            "time_slot": "10:00",
            "guests": 2,
            "notes": "Test reservation"
        }
        
        success, reservation = self.run_test("Create Reservation", "POST", "reservations", 200, reservation_data)
        if success and 'id' in reservation:
            res_id = reservation['id']
            print(f"   Created reservation: {res_id}")
            
            # Test getting the reservation
            self.run_test("Get Reservation", "GET", f"reservations/{res_id}", 200)
            
            # Test checkout session creation
            checkout_data = {
                "reservation_id": res_id,
                "origin_url": "https://yachtcancun.preview.emergentagent.com"
            }
            success, checkout = self.run_test("Create Checkout Session", "POST", "checkout/session", 200, checkout_data)
            if success and 'session_id' in checkout:
                session_id = checkout['session_id']
                print(f"   Created checkout session: {session_id}")
                
                # Test checkout status
                self.run_test("Get Checkout Status", "GET", f"checkout/status/{session_id}", 200)

    def test_seed_data(self):
        """Test data seeding"""
        print("\n=== SEED DATA TEST ===")
        self.run_test("Seed Data", "POST", "seed", 200)

    def print_summary(self):
        """Print test results summary"""
        print(f"\n{'='*50}")
        print(f"📊 TEST SUMMARY")
        print(f"{'='*50}")
        print(f"Total tests run: {self.tests_run}")
        print(f"Tests passed: {self.tests_passed}")
        print(f"Tests failed: {len(self.failed_tests)}")
        print(f"Success rate: {(self.tests_passed/self.tests_run*100):.1f}%" if self.tests_run > 0 else "0%")
        
        if self.failed_tests:
            print(f"\n❌ FAILED TESTS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"   {i}. {test['test']}")
                if 'expected' in test:
                    print(f"      Expected: {test['expected']}, Got: {test['actual']}")
                if 'error' in test:
                    print(f"      Error: {test['error']}")
        
        if self.passed_tests:
            print(f"\n✅ PASSED TESTS:")
            for i, test in enumerate(self.passed_tests, 1):
                print(f"   {i}. {test}")
        
        return len(self.failed_tests) == 0

def main():
    print("🚀 Starting Jola Yacht API Tests...")
    print(f"Testing against: https://yachtcancun.preview.emergentagent.com/api")
    
    tester = JolaYachtAPITester()
    
    # Run all tests
    tester.test_health_check()
    tester.test_seed_data()  # Seed data first
    tester.test_public_endpoints()
    tester.test_availability()
    
    # Admin tests
    if tester.test_admin_login():
        tester.test_admin_endpoints()
    
    tester.test_reservation_flow()
    
    # Print final summary
    success = tester.print_summary()
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())