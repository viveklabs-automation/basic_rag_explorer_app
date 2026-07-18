# ----------- Build the React frontend -----------
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build   # outputs to /frontend/dist

# ----------- Build the FastAPI backend -----------
FROM python:3.10-slim AS runtime
WORKDIR /app
# Install backend dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Copy backend source code
COPY backend/ .
# Copy compiled frontend assets into a static folder served by FastAPI
COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 8000
# Launch FastAPI with uvicorn
CMD uvicorn api:app --host 0.0.0.0 --port $PORT
