#!/usr/bin/env python3
"""
Test runner for the recommendation service
"""
import subprocess
import sys
import os

def run_tests():
    """Run tests with coverage reporting"""
    
    # Change to the backend directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print("🧪 Running Recommendation Service Tests...")
    print("=" * 50)
    
    # Run tests with coverage
    cmd = [
        "python", "-m", "pytest", 
        "test_recommendation_service.py",
        "-v",  # verbose output
        "--tb=short",  # shorter traceback format
        "--cov=recommendation_service",  # coverage for our module
        "--cov-report=term-missing",  # show missing lines
        "--cov-report=html:htmlcov",  # generate HTML coverage report
    ]
    
    try:
        result = subprocess.run(cmd, check=True)
        print("\n✅ All tests passed!")
        print("📊 Coverage report generated in htmlcov/index.html")
        return True
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Tests failed with exit code {e.returncode}")
        return False
    except FileNotFoundError:
        print("❌ pytest not found. Please install test dependencies:")
        print("   pip install -r requirements-test.txt")
        return False

def run_specific_test(test_name):
    """Run a specific test"""
    cmd = [
        "python", "-m", "pytest", 
        f"test_recommendation_service.py::{test_name}",
        "-v", "-s"
    ]
    
    try:
        subprocess.run(cmd, check=True)
        print(f"\n✅ Test {test_name} passed!")
    except subprocess.CalledProcessError:
        print(f"\n❌ Test {test_name} failed!")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Run specific test
        test_name = sys.argv[1]
        run_specific_test(test_name)
    else:
        # Run all tests
        success = run_tests()
        sys.exit(0 if success else 1) 