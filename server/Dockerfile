FROM node:20-alpine

WORKDIR /app

# Copy package.json only to install deps
COPY package*.json ./
RUN npm install

# Copy the rest of the server code
COPY . .

# Expose port Express listens on
EXPOSE 3000

# Development: npm run dev  |  Production (Railway): npm start
CMD ["npm", "run", "dev"]