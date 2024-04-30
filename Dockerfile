## production runner
FROM node:18.16.0 as prod-runner

# Move package.json
COPY package*.json .

# Install dependencies
RUN bun i --production

# Set work directory
WORKDIR /app

# Generate prisma client
RUN npx prisma generate

ENV TZ 'America/Sao_Paulo'

# Start bot
CMD [ "bun", "start" ] 
