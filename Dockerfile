FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY vite.config.js ./
COPY .env.production ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the React application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --production

# Copy built files from the build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.js ./

# Create uploads directory
RUN mkdir -p uploads

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Expose the port
EXPOSE 3001

# Start the server
CMD ["node", "server.js"] 