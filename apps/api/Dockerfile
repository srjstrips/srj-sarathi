FROM node:20-alpine AS builder
WORKDIR /app

# argon2 is a native addon — needs build tools
RUN apk add --no-cache python3 make g++

# Copy root workspace files
COPY package*.json ./
COPY tsconfig.base.json ./

# Copy api package.json
COPY apps/api/package*.json ./apps/api/

# Install ALL workspace deps from root
RUN npm install

# Copy api source
COPY apps/api ./apps/api
COPY packages ./packages

RUN npm run api:build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist           ./dist
COPY --from=builder /app/node_modules            ./node_modules
COPY --from=builder /app/apps/api/node_modules   ./apps/api/node_modules
EXPOSE 3001
CMD ["node", "dist/main.js"]
