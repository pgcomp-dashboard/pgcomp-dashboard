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

# Remove default static content
#RUN rm -rf /usr/share/nginx/html/*

# Write our custom nginx config
#COPY nginx/conf /default.conf

# Copy built assets from the builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
