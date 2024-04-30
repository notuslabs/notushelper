FROM oven/bun:1.1.6 as prod-runner

# Set work directory
WORKDIR /app

# Move package.json
COPY bun.lockb package.json ./ 

# Install production dependencies
RUN bun install --production

# Copy source code
COPY . .
# Prisma crashes if node is not installed (https://github.com/oven-sh/bun/issues/5320)
COPY --from=node:18 /usr/local/bin/node /usr/local/bin/node 

# Generate prisma client and build
RUN bunx prisma generate

ENV TZ 'America/Sao_Paulo'

# Start bot
CMD [ "bun", "run", "start" ] 
