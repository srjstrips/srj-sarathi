FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/
RUN npm install --workspace=apps/web
COPY apps/web ./apps/web
COPY packages ./packages
COPY tsconfig.base.json ./
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build --workspace=apps/web

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static     ./apps/web/.next/static
COPY --from=builder /app/apps/web/public           ./apps/web/public
EXPOSE 3002
ENV PORT=3002
ENV HOSTNAME=0.0.0.0
CMD ["node", "apps/web/server.js"]
