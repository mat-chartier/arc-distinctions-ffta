#!/bin/bash
# Lancer PostgreSQL puis le backend Node.js
echo "Démarrage de PostgreSQL..."
service postgresql start && \
echo "Démarrage du backend Node.js..." && \
cd /server && nohup npm start &

# Lancer Nginx en premier plan
echo "Démarrage de Nginx..."
nginx -g "daemon off;"
