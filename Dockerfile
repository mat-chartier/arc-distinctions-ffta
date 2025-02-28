# Étape 1 : Build du frontend Angular
FROM node:18 AS frontend-build
WORKDIR /app
COPY front /app
RUN npm install && npm run build --prod

# Étape 2 : Build du backend Node.js
FROM node:18 AS backend-build
WORKDIR /server
COPY backend /server
RUN npm install --omit=dev
RUN npm run build

# Étape 3 : Image finale avec Nginx, PostgreSQL et tous les services
FROM node:18 AS final
WORKDIR /

# Installer Nginx et PostgreSQL
RUN apt update && apt install -y nginx postgresql postgresql-contrib && \
    rm -rf /var/lib/apt/lists/*
    
# Configurer PostgreSQL
COPY postgres/pg_hba.conf /etc/postgresql/15/main/pg_hba.conf    
RUN mkdir -p /var/lib/postgresql/data
RUN service postgresql start && \
    psql -U postgres -c "create ROLE arcdistinctions WITH PASSWORD 'arcdistinctions' LOGIN SUPERUSER" && \
    psql -U postgres -c "create DATABASE arcdistinctions WITH OWNER arcdistinctions" && \
    psql -U postgres arcdistinctions -c "create SCHEMA arcdistinctions" && \
    service postgresql stop

# Copier le backend et installer ses dépendances
COPY --from=backend-build /server/dist /server/dist
COPY --from=backend-build /server/.env /server/.env
COPY --from=backend-build /server/package.json /server/package.json
WORKDIR /server
RUN npm install --omit=dev

# Copier le frontend vers Nginx
COPY --from=frontend-build /app/dist/arc-distionctions-ffta/browser /usr/share/nginx/html

# Copier la configuration Nginx
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Ajouter un script d’entrée pour tout lancer
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Exposer les ports
EXPOSE 80 443

# Lancer les services via le script
CMD ["/entrypoint.sh"]
