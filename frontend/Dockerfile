FROM node:23-alpine AS builder

ARG VITE_API_ENDPOINT
RUN test -n $VITE_API_ENDPOINT || (echo "VITE_API_ENDPOINT not set" && false)
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

EXPOSE 5000

CMD ["npm", "run", "dev"]
