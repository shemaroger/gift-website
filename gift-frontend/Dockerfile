FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ARG VITE_API_BASE_URL=https://www.giftrwa.org/api
ARG VITE_API=https://www.giftrwa.org/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API=$VITE_API
RUN npm run build

FROM nginx:alpine
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]