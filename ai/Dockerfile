# --- Stage 1: Base Dependencies Builder ---
FROM python:3.11-slim AS base

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and install wheel/setuptools
RUN pip install --no-cache-dir --upgrade pip wheel setuptools

# --- Stage 2: Dependencies Builder ---
FROM base AS builder

WORKDIR /build

# Copy only requirements.txt first for caching
COPY requirements.txt .

# Build wheels using pip cache mount (GitHub Actions)
RUN --mount=type=cache,target=/root/.cache/pip \
    pip wheel --no-cache-dir --no-deps --wheel-dir /build/wheels -r requirements.txt \
    --index-url https://mirrors.piconets.webwerks.in/pypi/web/simple \
    --extra-index-url https://pypi.org/simple

# --- Stage 3: Runtime Image ---
FROM python:3.11-slim AS runtime

# Install runtime system dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy pre-built wheels and requirements from builder
COPY --from=builder /build/wheels /tmp/wheels
COPY --from=builder /build/requirements.txt /tmp/requirements.txt

# Install Python dependencies
# Use wheels first, fallback to PyPI for any missing packages like hf-xet
RUN pip install --no-cache-dir --find-links /tmp/wheels -r /tmp/requirements.txt \
    && rm -rf /tmp/wheels /tmp/requirements.txt

# Copy application code in layers for caching efficiency
COPY --chown=appuser:appuser ./src/__init__.py ./src/
COPY --chown=appuser:appuser ./src/core/ ./src/core/
COPY --chown=appuser:appuser ./src/schemas/ ./src/schemas/
COPY --chown=appuser:appuser ./src/database/ ./src/database/
COPY --chown=appuser:appuser ./src/llm/ ./src/llm/
COPY --chown=appuser:appuser ./src/api/ ./src/api/
COPY --chown=appuser:appuser ./src/main.py ./src/

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Lightweight healthcheck using curl
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run Uvicorn in production mode
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--access-log", "--log-level", "info"]
