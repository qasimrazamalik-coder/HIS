FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm install

FROM deps AS build
COPY apps/api apps/api
WORKDIR /app/apps/api
RUN npm run prisma:generate && npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules node_modules
COPY --from=build /app/apps/api/dist dist
COPY --from=build /app/apps/api/prisma prisma
COPY apps/api/package.json package.json
EXPOSE 4000
CMD ["node", "dist/server.js"]

