# Use official Node.js image for building

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ENV NEXT_PUBLIC_API_BASE_URL=https://alokbortikaedu.com/api
RUN npm run build

# Use a lightweight web server for serving static files
FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app .
EXPOSE 3000
CMD ["npm", "start"]
