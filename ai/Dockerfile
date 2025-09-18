# --- Stage 1: Base Dependencies Builder ---
# Minimal Python image with build tools
FROM python:3.13-slim AS base

# Install system dependencies in a single layer
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip & install wheel/setuptools
RUN pip install --no-cache-dir --upgrade pip wheel setuptools

# --- Stage 2: Dependencies Builder ---
FROM base AS builder

WORKDIR /build

# Copy only requirements to leverage Docker cache
COPY requirements.txt .

# Use pip cache mount for faster builds in GitHub Actions
# This requires --mount=type=cache in GitHub Actions build command
RUN --mount=type=cache,target=/root/.cache/pip \
    pip wheel --no-cache-dir --no-deps --wheel-dir /build/wheels -r requirements.txt \
    --index-url https://mirrors.piconets.webwerks.in/pypi/web/simple \
    --extra-index-url https://pypi.org/simple

# --- Stage 3: Runtime Image ---
FROM python:3.13-slim AS runtime

# Install runtime system dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app

# Copy wheels from builder
COPY --from=builder /build/wheels /tmp/wheels

# Install Python dependencies from wheels for speed
RUN pip install --no-cache-dir --no-index --find-links /tmp/wheels -r /build/requirements.txt \
    && rm -rf /tmp/wheels

# Copy application code in layers to maximize cache
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

# Run Uvicorn with production settings
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--access-log", "--log-level", "info"]
