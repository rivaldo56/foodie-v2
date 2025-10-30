#!/usr/bin/env python3
"""
Comprehensive test runner for ChefConnect API
"""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner
from django.core.management import execute_from_command_line

def run_tests():
    """Run all tests with coverage and detailed output"""
    
    print("🧪 ChefConnect API Test Suite")
    print("=" * 50)
    
    # Set up Django environment
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'chefconnect.settings')
    django.setup()
    
    # Test categories
    test_categories = {
        'Authentication': 'tests.test_authentication',
        'Payments': 'tests.test_payments', 
        'AI Services': 'tests.test_ai_services',
        'WebSockets': 'tests.test_websockets',
    }
    
    total_tests = 0
    passed_tests = 0
    failed_tests = 0
    
    for category, test_module in test_categories.items():
        print(f"\n📋 Running {category} Tests...")
        print("-" * 30)
        
        try:
            # Run specific test module
            result = execute_from_command_line([
                'manage.py', 'test', test_module, '--verbosity=2'
            ])
            
            print(f"✅ {category} tests completed")
            
        except SystemExit as e:
            if e.code == 0:
                print(f"✅ {category} tests passed")
                passed_tests += 1
            else:
                print(f"❌ {category} tests failed")
                failed_tests += 1
        except Exception as e:
            print(f"❌ {category} tests error: {str(e)}")
            failed_tests += 1
        
        total_tests += 1
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary")
    print("=" * 50)
    print(f"Total Categories: {total_tests}")
    print(f"Passed: {passed_tests}")
    print(f"Failed: {failed_tests}")
    
    if failed_tests == 0:
        print("🎉 All test categories completed!")
    else:
        print(f"⚠️  {failed_tests} test categories had issues")
    
    return failed_tests == 0

def run_specific_tests():
    """Run specific test categories based on command line args"""
    
    if len(sys.argv) < 2:
        print("Usage: python run_tests.py [auth|payments|ai|websockets|all]")
        return
    
    test_type = sys.argv[1].lower()
    
    test_mapping = {
        'auth': 'tests.test_authentication',
        'payments': 'tests.test_payments',
        'ai': 'tests.test_ai_services', 
        'websockets': 'tests.test_websockets',
        'all': None
    }
    
    if test_type == 'all':
        run_tests()
    elif test_type in test_mapping:
        test_module = test_mapping[test_type]
        print(f"🧪 Running {test_type.title()} Tests")
        print("=" * 30)
        
        execute_from_command_line([
            'manage.py', 'test', test_module, '--verbosity=2'
        ])
    else:
        print(f"Unknown test type: {test_type}")
        print("Available types: auth, payments, ai, websockets, all")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        run_specific_tests()
    else:
        run_tests()
