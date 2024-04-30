## production runner
FROM oven/bun:1.1.5 as prod-runner

# Move package.json
COPY package*.json .

# Install dependencies
RUN bun i

# Set work directory
WORKDIR /app

# Copy source code
COPY . .

# Generate prisma client
RUN bun run prisma generate

ENV TZ 'America/Sao_Paulo'

# Install production dependencies
RUN bun install --production

# Start bot
CMD [ "bun", "run", "start" ] 
