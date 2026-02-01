# --------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /backend
COPY package*.json ./
RUN npm install

# --------- Runtime stage ----------
FROM node:20-alpine
WORKDIR /backend
COPY --from=builder /backend/node_modules ./node_modules
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
