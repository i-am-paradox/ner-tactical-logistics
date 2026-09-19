FROM node:20-slim AS builder

WORKDIR /app

# Install frontend dependencies
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Build frontend
COPY frontend ./frontend
RUN cd frontend && npm run build

# Stage 2: Runtime
FROM node:20-slim

WORKDIR /app

# Install backend production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source
COPY backend ./backend

# Copy data folder (needed for GeoJSON networks & seeds)
COPY data ./data

# Copy built frontend dist from builder stage
COPY --from=builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "backend/src/app.js"]
