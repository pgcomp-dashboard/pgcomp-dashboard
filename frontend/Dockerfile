FROM node:23-alpine AS builder

ARG VITE_API_ENDPOINT
RUN test -n "$VITE_API_ENDPOINT" || (echo "VITE_API_ENDPOINT not set" && false)
ENV VITE_API_ENDPOINT=$VITE_API_ENDPOINT

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else echo "Lockfile not found." && exit 1; \
    fi

COPY . .

RUN \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f pnpm-lock.yaml ]; then pnpm run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

# ────────────────
# Stage 2: Serve
# ────────────────
FROM nginx:stable-alpine

# Remove default static content
RUN rm -rf /usr/share/nginx/html/*

# Write our custom nginx config
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen       80;
    server_name  _;

    root   /usr/share/nginx/html;
    index  index.html;

    # SPA client-side routing: try file, then fallback to index.html
    location / {
        try_files $uri /index.html =404;
    }

    # Optional: caching of static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico)$ {
        expires 1y;
        add_header Cache-Control "public";
    }
}
EOF

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
