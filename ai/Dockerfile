# --- Stage 3: Runtime Image ---
FROM python:3.11-slim AS runtime

# Install runtime system dependencies only
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Make a writable cache directory for HF models
RUN mkdir -p /opt/hf_cache && chown -R appuser:appuser /opt/hf_cache

WORKDIR /app

# Copy pre-built wheels and requirements
COPY --from=builder /build/wheels /tmp/wheels
COPY --from=builder /build/requirements.txt /tmp/requirements.txt

# Install Python dependencies
RUN pip install --no-cache-dir --find-links /tmp/wheels -r /tmp/requirements.txt \
    && rm -rf /tmp/wheels /tmp/requirements.txt

# Copy application code
COPY --chown=appuser:appuser ./src/ ./src/

# Set environment variables so HF/SentenceTransformers uses writable cache
ENV TRANSFORMERS_CACHE=/opt/hf_cache \
    HF_HOME=/opt/hf_cache \
    HF_DATASETS_CACHE=/opt/hf_cache \
    HF_MODULES_CACHE=/opt/hf_cache

# Pre-download the model to avoid runtime download
USER appuser
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('sentence-transformers/all-MiniLM-L6-v2')"

# Expose port
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/ || exit 1

# Run Uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "1", "--access-log", "--log-level", "info"]
