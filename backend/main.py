import sys
import os

# Ensure the root directory is in sys.path so 'app' prefix works
# sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    # Use $PORT from environment (defaulting to 8000 for standard FastAPI binding)
    port = int(os.environ.get("PORT", 8000))
    # Note: Use 'app.main:app' to ensure the same module reload path
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
