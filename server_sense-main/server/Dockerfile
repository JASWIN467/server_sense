FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including nodemon for dev)
RUN npm install

# Copy source code
COPY . .

# Expose backend port
EXPOSE 5000

# Use node directly in production (not nodemon)
CMD ["node", "index.js"]