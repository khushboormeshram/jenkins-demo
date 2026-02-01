# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine

WORKDIR /frontend

RUN npm install -g serve

COPY --from=builder /frontend/dist ./dist

EXPOSE 5173
CMD ["serve", "-s", "dist", "-l", "5173"]
