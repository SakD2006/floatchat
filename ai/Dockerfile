# --- Stage 1: Base Dependencies Builder ---
# This stage handles system dependencies and Python setup
FROM python:3.13-slim as base

# Install system dependencies in a single layer to reduce image size
# Group all system packages together for better caching
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Upgrade pip and install wheel in a separate layer for better caching
RUN pip install --no-cache-dir --upgrade pip wheel setuptools

# --- Stage 2: Dependencies Builder ---
# This stage builds Python wheels for dependencies
FROM base as builder

WORKDIR /build

# Copy only requirements.txt first to leverage Docker layer caching
# This layer will only rebuild if requirements.txt changes
COPY requirements.txt .

# Build wheels with optimized flags for faster builds and smaller size
# Use multiple index URLs for better package availability
# Store wheels in a dedicated directory for clean copying
RUN pip wheel \
    --no-cache-dir \
    --no-deps \
    --wheel-dir /build/wheels \
    --index-url https://mirrors.piconets.webwerks.in/pypi/web/simple \
    --extra-index-url https://pypi.org/simple \
    --find-links /build/wheels \
    -r requirements.txt

# --- Stage 3: Runtime Image ---
# This stage creates the final, optimized runtime image
FROM python:3.13-slim as runtime

# Install only runtime system dependencies (smaller set than build dependencies)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create non-root user for better security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Set working directory
WORKDIR /app

# Copy pre-built wheels from builder stage
COPY --from=builder /build/wheels /tmp/wheels

# Install Python dependencies from wheels (much faster than building from source)
RUN pip install --no-cache-dir --no-index --find-links /tmp/wheels \
    $(ls /tmp/wheels/*.whl | xargs -n1 basename | sed 's/-.*$//' | sort -u) \
    && rm -rf /tmp/wheels

# Copy application code in layers based on change frequency
# Copy static configuration files first (changes less frequently)
COPY --chown=appuser:appuser ./src/__init__.py ./src/
COPY --chown=appuser:appuser ./src/core/ ./src/core/
COPY --chown=appuser:appuser ./src/schemas/ ./src/schemas/
COPY --chown=appuser:appuser ./src/database/ ./src/database/

# Copy business logic (changes more frequently)
COPY --chown=appuser:appuser ./src/llm/ ./src/llm/
COPY --chown=appuser:appuser ./src/api/ ./src/api/

# Copy main application file last (most likely to change during development)
COPY --chown=appuser:appuser ./src/main.py ./src/

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Add healthcheck for better container orchestration
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/', timeout=10)" || exit 1

# Use exec form for better signal handling
# Add production-optimized uvicorn settings
CMD ["uvicorn", "src.main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "1", \
     "--access-log", \
     "--log-level", "info"]