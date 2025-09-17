# Update this to a newer version of Node.js
FROM node:18
# set the work dir
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application files and build
COPY . .
RUN npm run build

# EXPOSE to Port 3000
EXPOSE 3000

CMD ["npm", "run", "start:prod"]
