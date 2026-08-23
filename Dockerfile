# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Base image shared by every stage
# ---------------------------------------------------------------------------
FROM node:20-alpine AS base
WORKDIR /app
# Required on Alpine for native Node addons (bcryptjs/sharp-style deps).
RUN apk add --no-cache libc6-compat

# ---------------------------------------------------------------------------
# deps: install dependencies once, reused by the "dev" and "builder" stages
# ---------------------------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---------------------------------------------------------------------------
# dev: used by docker-compose.yml for local development (hot reload)
# ---------------------------------------------------------------------------
FROM base AS dev
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---------------------------------------------------------------------------
# builder: compiles the production build (standalone output)
# ---------------------------------------------------------------------------
FROM base AS builder
ENV NODE_ENV=production

# NEXT_PUBLIC_* variables are inlined into the JS bundle at build time, so
# they must be passed in as build args. Render automatically forwards the
# service's environment variables as Docker build args (see render.yaml).
ARG NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# runner: minimal production image, only the traced runtime files
# ---------------------------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# Liveness (/api/health) et non readiness (/api/ready) : le rôle de ce check est
# de détecter un process mort, pas une dépendance externe indisponible. Une base
# momentanément injoignable ne doit pas faire redémarrer un conteneur sain — la
# vérification de MongoDB est faite par le health check Render sur /api/ready.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
