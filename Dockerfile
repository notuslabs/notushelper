## production runner
FROM oven/bun:1.1.5 as prod-runner

# Move package.json
COPY package*.json .

# Install dependencies
RUN bun i --production

# Set work directory
WORKDIR /app

# Generate prisma client
RUN bunx prisma generate

ENV TZ 'America/Sao_Paulo'

# Start bot
CMD [ "bun", "start" ] 
