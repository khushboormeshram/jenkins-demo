FROM node:20-alpine

RUN apk add --no-cache supervisor

# ---------- FRONTEND ----------
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend .

# ---------- BACKEND ----------
WORKDIR /backend
COPY backend/package*.json ./
RUN npm install
COPY backend .

# Supervisor config
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 5000 5173
CMD ["supervisord", "-c", "/etc/supervisord.conf"]