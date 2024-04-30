FROM oven/bun:1.1.5 as prod-runner

# Set work directory
WORKDIR /app

# Move package.json
COPY bun.lockb package.json ./ 

# Install production dependencies
RUN bun install --production

# Copy source code
COPY . .

# Generate prisma client and build
RUN bunx prisma generate

ENV TZ 'America/Sao_Paulo'

# Start bot
CMD [ "bun", "run", "start" ] 
