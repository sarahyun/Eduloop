#!/usr/bin/env python3
"""
Comprehensive test runner for Eduloop backend.
Runs all unit tests, integration tests, and e2e tests with proper configuration.
"""
import os
import sys
import subprocess
import argparse
from pathlib import Path


def setup_environment():
    """Set up test environment variables."""
    os.environ["TESTING"] = "true"
    os.environ["MONGODB_URL"] = "mongodb://localhost:27017/eduloop_test"
    os.environ["OPENAI_API_KEY"] = "test_key"
    os.environ["JWT_SECRET"] = "test_secret"
    os.environ["ENVIRONMENT"] = "test"


def run_command(command, description):
    """Run a command and handle output."""
    print(f"\n{'='*60}")
    print(f"🧪 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            cwd=Path(__file__).parent.parent
        )
        
        if result.stdout:
            print(result.stdout)
        
        if result.stderr:
            print("STDERR:", result.stderr)
        
        if result.returncode != 0:
            print(f"❌ {description} failed with return code {result.returncode}")
            return False
        else:
            print(f"✅ {description} completed successfully")
            return True
            
    except Exception as e:
        print(f"❌ Error running {description}: {e}")
        return False


def run_unit_tests(verbose=False):
    """Run all unit tests."""
    verbose_flag = "-v" if verbose else ""
    command = f"python -m pytest tests/unit/ {verbose_flag} --tb=short"
    return run_command(command, "Running Unit Tests")


def run_e2e_tests(verbose=False):
    """Run all end-to-end tests."""
    verbose_flag = "-v" if verbose else ""
    command = f"python -m pytest tests/e2e/ {verbose_flag} --tb=short"
    return run_command(command, "Running End-to-End Tests")


def run_coverage_tests():
    """Run tests with coverage reporting."""
    command = (
        "python -m pytest tests/ "
        "--cov=. "
        "--cov-report=html:htmlcov "
        "--cov-report=term-missing "
        "--cov-exclude='tests/*' "
        "--cov-exclude='*/__pycache__/*' "
        "--tb=short"
    )
    return run_command(command, "Running Tests with Coverage")


def run_linting():
    """Run code linting."""
    commands = [
        ("python -m flake8 . --exclude=tests,htmlcov,__pycache__ --max-line-length=100", "Flake8 Linting"),
        ("python -m black --check . --exclude='/(tests|htmlcov|__pycache__)/'", "Black Code Formatting Check"),
    ]
    
    results = []
    for command, description in commands:
        results.append(run_command(command, description))
    
    return all(results)


def run_type_checking():
    """Run type checking with mypy."""
    command = "python -m mypy . --ignore-missing-imports --exclude='tests|htmlcov'"
    return run_command(command, "Type Checking with MyPy")


def run_security_check():
    """Run security vulnerability check."""
    command = "python -m bandit -r . -x tests,htmlcov"
    return run_command(command, "Security Check with Bandit")


def install_test_dependencies():
    """Install test dependencies."""
    command = "pip install -r requirements-test.txt"
    return run_command(command, "Installing Test Dependencies")


def main():
    """Main test runner function."""
    parser = argparse.ArgumentParser(description="Eduloop Backend Test Runner")
    parser.add_argument("--unit", action="store_true", help="Run only unit tests")
    parser.add_argument("--e2e", action="store_true", help="Run only e2e tests")
    parser.add_argument("--coverage", action="store_true", help="Run tests with coverage")
    parser.add_argument("--lint", action="store_true", help="Run linting checks")
    parser.add_argument("--type-check", action="store_true", help="Run type checking")
    parser.add_argument("--security", action="store_true", help="Run security checks")
    parser.add_argument("--all", action="store_true", help="Run all tests and checks")
    parser.add_argument("--install-deps", action="store_true", help="Install test dependencies")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")
    parser.add_argument("--fast", action="store_true", help="Run fast tests only (skip slow checks)")
    
    args = parser.parse_args()
    
    # Set up environment
    setup_environment()
    
    print("🚀 Eduloop Backend Test Suite")
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    
    results = []
    
    # Install dependencies if requested
    if args.install_deps:
        results.append(install_test_dependencies())
    
    # Determine what to run
    if args.all:
        # Run everything
        results.extend([
            run_unit_tests(args.verbose),
            run_e2e_tests(args.verbose),
            run_coverage_tests(),
            run_linting(),
            run_type_checking() if not args.fast else True,
            run_security_check() if not args.fast else True,
        ])
    else:
        # Run specific tests based on flags
        if args.unit:
            results.append(run_unit_tests(args.verbose))
        
        if args.e2e:
            results.append(run_e2e_tests(args.verbose))
        
        if args.coverage:
            results.append(run_coverage_tests())
        
        if args.lint:
            results.append(run_linting())
        
        if args.type_check:
            results.append(run_type_checking())
        
        if args.security:
            results.append(run_security_check())
        
        # If no specific flags, run basic tests
        if not any([args.unit, args.e2e, args.coverage, args.lint, args.type_check, args.security]):
            results.extend([
                run_unit_tests(args.verbose),
                run_e2e_tests(args.verbose),
            ])
    
    # Summary
    print(f"\n{'='*60}")
    print("📊 TEST SUMMARY")
    print(f"{'='*60}")
    
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✅ All {total} test suites passed!")
        exit_code = 0
    else:
        failed = total - passed
        print(f"❌ {failed} out of {total} test suites failed")
        exit_code = 1
    
    print(f"\nResults: {passed}/{total} passed")
    
    if args.coverage:
        print("\n📈 Coverage report generated in htmlcov/index.html")
    
    sys.exit(exit_code)


if __name__ == "__main__":
    main() 