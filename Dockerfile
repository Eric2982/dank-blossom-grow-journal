# Stage 1: Build the Vite/React app
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy source code
COPY . .

# Accept build-time environment variables (VITE_* vars are embedded at build time)
ARG VITE_BASE44_APP_ID
ARG VITE_BASE44_APP_BASE_URL
ARG VITE_GOOGLE_API_KEY

ENV VITE_BASE44_APP_ID=$VITE_BASE44_APP_ID
ENV VITE_BASE44_APP_BASE_URL=$VITE_BASE44_APP_BASE_URL
ENV VITE_GOOGLE_API_KEY=$VITE_GOOGLE_API_KEY

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Copy built static assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Configure nginx for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Cloud Run expects port 8080
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
