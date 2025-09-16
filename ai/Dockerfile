# --- Stage 1: Builder ---
# This stage installs dependencies and builds wheels
FROM python:3.13-slim as builder

WORKDIR /app

# Install pip and wheel
RUN pip install --upgrade pip

# Copy requirements and build wheels for faster installation
COPY requirements.txt .
# This is the new, faster line
# In your Dockerfile, replace the old pip wheel command with this one:

RUN pip wheel --no-cache-dir --index-url https://mirrors.piconets.webwerks.in/pypi/web/simple --extra-index-url https://pypi.org/simple --wheel-dir /app/wheels -r requirements.txt
# --- Stage 2: Final Image ---
# This stage creates the final, lean image for running the application
FROM python:3.13-slim

WORKDIR /app

# Copy the pre-built wheels from the builder stage
COPY --from=builder /app/wheels /wheels

# Install the dependencies from the wheels
RUN pip install --no-cache /wheels/*

# Copy your application's source code into the container
COPY ./src ./src

# Expose the port the app runs on
EXPOSE 8000

# Command to run the application using Uvicorn
# We don't use --reload in a production container
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]