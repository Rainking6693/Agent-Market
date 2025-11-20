# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=20.18.1
FROM node:${NODE_VERSION}-slim AS base

LABEL fly_launch_runtime="NestJS/Prisma"

# NestJS/Prisma app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base AS build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp openssl pkg-config python-is-python3

# Copy root package files for workspace setup
COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/
COPY packages/config/package.json packages/config/
COPY packages/sdk/package.json packages/sdk/

# Install all dependencies (including workspace packages)
RUN npm ci

# Build workspace packages first
COPY packages/config packages/config
COPY packages/sdk packages/sdk
RUN npm run build --workspace @agent-market/config && \
    npm run build --workspace @agent-market/sdk

# Generate Prisma Client
COPY apps/api/prisma apps/api/prisma
RUN cd apps/api && npx prisma generate

# Copy API application code
COPY apps/api apps/api

# Build API application
RUN cd apps/api && npm run build


# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy package files
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/packages/config/package.json ./packages/config/
COPY --from=build /app/packages/sdk/package.json ./packages/sdk/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built packages (dist folders)
COPY --from=build /app/packages/config/dist ./packages/config/dist
COPY --from=build /app/packages/sdk/dist ./packages/sdk/dist

# Copy built API application and Prisma schema
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma

# Copy Prisma generated client from build stage
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma

# Start the server by default, this can be overwritten at runtime
EXPOSE 3000
WORKDIR /app/apps/api
CMD [ "node", "dist/main.js" ]
