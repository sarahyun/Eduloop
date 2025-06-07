# Eduloop Backend Testing Framework

This directory contains a comprehensive testing suite for the Eduloop backend application, including unit tests, integration tests, and end-to-end tests.

## 📁 Directory Structure

```
tests/
├── README.md                    # This file
├── conftest.py                  # Shared pytest fixtures and configuration
├── run_all_tests.py            # Comprehensive test runner script
├── __init__.py                 # Package initialization
├── unit/                       # Unit tests
│   ├── __init__.py
│   ├── core/                   # Core module tests
│   │   ├── __init__.py
│   │   └── test_database.py    # Database functionality tests
│   ├── services/               # Service layer tests
│   │   ├── __init__.py
│   │   ├── test_user_service.py
│   │   └── test_response_service.py
│   └── test_models.py          # Pydantic model tests
└── e2e/                        # End-to-end tests
    ├── __init__.py
    ├── test_user_routes.py      # User API endpoint tests
    ├── test_response_routes.py  # Response API endpoint tests
    └── test_recommendation_routes.py  # Recommendation API tests
```

## 🧪 Test Categories

### Unit Tests (`tests/unit/`)
- **Purpose**: Test individual components in isolation
- **Scope**: Functions, classes, and modules
- **Dependencies**: Mocked external dependencies
- **Speed**: Fast execution (< 1 second per test)

**Coverage includes:**
- Core database functionality
- Service layer business logic
- Data model validation
- Utility functions

### End-to-End Tests (`tests/e2e/`)
- **Purpose**: Test complete user workflows through API endpoints
- **Scope**: Full request-response cycles
- **Dependencies**: Mocked services, real HTTP clients
- **Speed**: Medium execution (1-5 seconds per test)

**Coverage includes:**
- API endpoint functionality
- Request/response validation
- Error handling
- Authentication flows

## 🚀 Running Tests

### Quick Start

```bash
# Run all tests
python tests/run_all_tests.py

# Run with verbose output
python tests/run_all_tests.py --verbose

# Run only unit tests
python tests/run_all_tests.py --unit

# Run only e2e tests
python tests/run_all_tests.py --e2e
```

### Using pytest directly

```bash
# Run all tests
pytest

# Run unit tests only
pytest tests/unit/

# Run e2e tests only
pytest tests/e2e/

# Run with coverage
pytest --cov=. --cov-report=html

# Run specific test file
pytest tests/unit/test_models.py

# Run specific test class
pytest tests/unit/test_models.py::TestUserModels

# Run specific test method
pytest tests/unit/test_models.py::TestUserModels::test_user_model_valid
```

### Advanced Test Runner Options

```bash
# Install test dependencies
python tests/run_all_tests.py --install-deps

# Run all tests and checks
python tests/run_all_tests.py --all

# Run with coverage reporting
python tests/run_all_tests.py --coverage

# Run linting checks
python tests/run_all_tests.py --lint

# Run type checking
python tests/run_all_tests.py --type-check

# Run security checks
python tests/run_all_tests.py --security

# Fast mode (skip slow checks)
python tests/run_all_tests.py --all --fast
```

## 🔧 Test Configuration

### Environment Variables
Tests automatically set up the following environment variables:
- `TESTING=true`
- `MONGODB_URL=mongodb://localhost:27017/eduloop_test`
- `OPENAI_API_KEY=test_key`
- `JWT_SECRET=test_secret`
- `ENVIRONMENT=test`

### Pytest Configuration
Configuration is defined in `pytest.ini`:
- Test discovery patterns
- Output formatting
- Test markers
- Coverage settings
- Asyncio support

### Test Markers
Use markers to categorize and run specific test types:

```bash
# Run only database tests
pytest -m database

# Run only API tests
pytest -m api

# Skip slow tests
pytest -m "not slow"

# Run authentication tests
pytest -m auth
```

## 📊 Coverage Reporting

### Generate Coverage Reports

```bash
# HTML coverage report
pytest --cov=. --cov-report=html
# View at htmlcov/index.html

# Terminal coverage report
pytest --cov=. --cov-report=term-missing

# XML coverage report (for CI/CD)
pytest --cov=. --cov-report=xml
```

### Coverage Targets
- **Overall**: > 90%
- **Core modules**: > 95%
- **Service layer**: > 90%
- **API routes**: > 85%

## 🏗️ Writing Tests

### Unit Test Example

```python
import pytest
from unittest.mock import AsyncMock, patch
from services.user_service import UserService
from models import UserCreate

class TestUserService:
    @pytest.fixture
    def user_service(self):
        with patch('services.user_service.db_manager') as mock_db:
            return UserService()
    
    @pytest.mark.asyncio
    async def test_create_user_success(self, user_service):
        # Test implementation
        pass
```

### E2E Test Example

```python
import pytest
from httpx import AsyncClient
from main import app

class TestUserRoutes:
    @pytest.fixture
    async def client(self):
        async with AsyncClient(app=app, base_url="http://test") as client:
            yield client
    
    @pytest.mark.asyncio
    async def test_create_user_success(self, client):
        response = await client.post("/users/", json={"user_id": "test"})
        assert response.status_code == 201
```

### Best Practices

1. **Test Naming**: Use descriptive names that explain what is being tested
2. **Arrange-Act-Assert**: Structure tests clearly
3. **Mocking**: Mock external dependencies and database calls
4. **Fixtures**: Use fixtures for common test data and setup
5. **Async Tests**: Use `@pytest.mark.asyncio` for async functions
6. **Error Cases**: Test both success and failure scenarios

## 🔍 Debugging Tests

### Running Individual Tests

```bash
# Run with verbose output and no capture
pytest tests/unit/test_models.py::TestUserModels::test_user_model_valid -v -s

# Run with pdb debugger
pytest tests/unit/test_models.py::TestUserModels::test_user_model_valid --pdb

# Run and stop on first failure
pytest tests/unit/ -x
```

### Common Issues

1. **Import Errors**: Ensure PYTHONPATH includes the backend directory
2. **Async Issues**: Use `@pytest.mark.asyncio` for async test functions
3. **Mock Issues**: Verify mock paths match actual import paths
4. **Database Tests**: Ensure test database is properly isolated

## 🚀 Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      - name: Run tests
        run: python tests/run_all_tests.py --all
```

## 📈 Test Metrics

### Key Metrics to Track
- **Test Coverage**: Percentage of code covered by tests
- **Test Count**: Total number of tests
- **Test Duration**: Time taken to run test suite
- **Flaky Tests**: Tests that intermittently fail
- **Test Reliability**: Percentage of test runs that pass

### Monitoring
- Use coverage reports to identify untested code
- Monitor test execution time to prevent slow test suite
- Track test failures to identify flaky tests
- Regular review of test quality and maintainability

## 🤝 Contributing

When adding new features:

1. **Write tests first** (TDD approach recommended)
2. **Maintain coverage** above target thresholds
3. **Update documentation** for new test patterns
4. **Run full test suite** before submitting PRs
5. **Add appropriate markers** for new test categories

## 📚 Additional Resources

- [pytest Documentation](https://docs.pytest.org/)
- [pytest-asyncio Documentation](https://pytest-asyncio.readthedocs.io/)
- [FastAPI Testing Guide](https://fastapi.tiangolo.com/tutorial/testing/)
- [Python Testing Best Practices](https://docs.python-guide.org/writing/tests/) 