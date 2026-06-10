FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# La URL se lee desde .env.production durante el build

RUN npm run build

# Etapa de servidor NGINX
FROM nginx:alpine
# Copiar la build
COPY --from=build /app/dist /usr/share/nginx/html
# Copiar configuracion para React Router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
