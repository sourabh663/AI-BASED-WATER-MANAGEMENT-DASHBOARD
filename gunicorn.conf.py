import os
import sys

# Point to backend directory so app.main is importable from repo root
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(current_dir, "backend")
if os.path.isdir(backend_dir):
    pythonpath = "backend"
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

# Worker class for FastAPI / ASGI
worker_class = "uvicorn.workers.UvicornWorker"

# Bind to the dynamic PORT provided by Render (default 8000)
port = os.environ.get("PORT", "8000")
bind = f"0.0.0.0:{port}"

# Concurrency & timeout
workers = int(os.environ.get("WEB_CONCURRENCY", "1"))
timeout = 120
keepalive = 5
