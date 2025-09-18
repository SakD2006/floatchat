# --- Stage 1: Base Dependencies ---
FROM python:3.11-slim AS base

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential gcc g++ libpq-dev curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip and setuptools
RUN pip install --no-cache-dir --upgrade pip wheel setuptools

# --- Stage 2: Build Wheels ---
FROM base AS builder

WORKDIR /build

# Copy only requirements.txt for caching
COPY requirements.txt .

# Build wheels using pip cache
RUN --mount=type=cache,target=/root/.cache/pip \
    pip wheel --no-cache-dir --wheel-dir /build/wheels -r requirements.txt

# --- Stage 3: Runtime Image ---
FROM python:3.11-slim AS runtime

# Install runtime dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Make a writable cache directory for Hugging Face
RUN mkdir -p /opt/hf_cache && chown -R appuser:appuser /opt/hf_cache

WORKDIR /app

# Copy pre-built wheels and requirements from builder stage
COPY --from=builder /build/wheels /tmp/wheels
COPY --from=builder /build/requirements.txt /tmp/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --find-links /tmp/wheels -r /tmp/requirements.txt \
    && rm -rf /tmp/wheels /tmp/requirements.txt

# Copy application code
COPY --chown=appuser:appuser ./src/ ./src/

# Set environment variables so HF uses writable cache
ENV TRANSFORMERS_CACHE=/opt/hf_cache \
    HF_HOME=/opt/hf_cache \
    HF_DATASETS_CACHE=/opt/hf_cache \
    HF_MODULES_CACHE=/opt/hf_cache

# Switch to non-root user
USER appuser

# Pre-download Hugging Face model to avoid runtime download/permission errors
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Expose port
EXPOSE 8000

# Lightweight healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run Uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--access-log", "--log-level", "info"]
