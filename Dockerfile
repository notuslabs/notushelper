## build runner
FROM node:18.16.0 as build-runner

# Set temp directory
WORKDIR /tmp/app

# Move package.json
COPY package*.json .

# Install dependencies
RUN npm ci

# Move source files
COPY src ./src
COPY prisma ./prisma
COPY tsconfig.json   .

# Build project
RUN npm run build

## production runner
FROM node:18.16.0 as prod-runner

# Set work directory
WORKDIR /app

# Copy package.json from build-runner
COPY --from=build-runner /tmp/app/package.json /app/package.json

# Install dependencies
RUN npm install --omit=dev

# Move build files
COPY --from=build-runner /tmp/app/build /app/build
COPY --from=build-runner /tmp/app/prisma /app/prisma

# Generate prisma client
RUN npx prisma generate

ENV TZ 'America/Sao_Paulo'

# Start bot
CMD [ "npm", "run", "start" ]
