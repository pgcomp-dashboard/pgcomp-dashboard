FROM node:24-alpine AS builder

ARG VITE_API_ENDPOINT=https://dashboard-pgcomp-api.app.ic.ufba.br
RUN test -n $VITE_API_ENDPOINT || (echo "VITE_API_ENDPOINT not set" && false)
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json ./

RUN npm i

COPY . .

RUN npm run build

# ────────────────
# Stage 2: Serve
# ────────────────
FROM nginx:stable-alpine

# 1. Remove ALL default configs to avoid conflicts
RUN rm /etc/nginx/conf.d/default.conf

# 2. Copy custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 3. Copy assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
