FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG TELEGRAM_BOT_URL=""
RUN TELEGRAM_BOT_URL="$TELEGRAM_BOT_URL" npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build/prod/ /usr/share/nginx/html/
EXPOSE 80
