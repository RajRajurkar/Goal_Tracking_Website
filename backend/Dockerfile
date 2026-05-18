FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create exports directory
RUN mkdir -p /app/exports /app/logs

EXPOSE 5000

CMD ["node", "server.js"]