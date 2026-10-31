import os

# Worker class for FastAPI / ASGI
worker_class = "uvicorn.workers.UvicornWorker"

# Bind to the dynamic PORT provided by Render (default 8000)
port = os.environ.get("PORT", "8000")
bind = f"0.0.0.0:{port}"

# Concurrency & timeout
workers = int(os.environ.get("WEB_CONCURRENCY", "1"))
timeout = 120
keepalive = 5
