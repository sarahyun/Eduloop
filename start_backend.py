#!/usr/bin/env python3
import os
import subprocess
import sys

if __name__ == "__main__":
    # Change to backend directory
    backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
    os.chdir(backend_path)
    
    print("Starting FastAPI backend on http://localhost:8000")
    
    # Run uvicorn directly with the import string format
    subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "main:app", 
        "--host", "0.0.0.0", 
        "--port", "8000", 
        "--reload"
    ])