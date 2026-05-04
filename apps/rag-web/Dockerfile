FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
COPY apps/rag-web/package.json apps/rag-web/package.json
RUN npm install
COPY apps/rag-web apps/rag-web
WORKDIR /app/apps/rag-web
EXPOSE 5174
CMD ["npm", "run", "dev"]

