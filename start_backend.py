#!/usr/bin/env python3
import os
import sys
sys.path.append('backend')

if __name__ == "__main__":
    os.chdir('backend')
    import uvicorn
    from main import app
    
    uvicorn.run(app, host="0.0.0.0", port=5000, reload=True)