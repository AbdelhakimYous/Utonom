#!/bin/bash

# Générer la clé si elle n'existe pas
if [ ! -f ".env" ]; then
    cp .env.example .env
fi

# Attendre que la base de données soit disponible
echo "⏳ Attente de la base de données..."
until php artisan migrate:status >/dev/null 2>&1; do
  sleep 2
  echo "⏳ En attente de la DB..."
done

# Exécute les migrations
echo "✅ Base de données disponible, exécution des migrations..."
php artisan migrate --force

# Démarrer PHP-FPM
echo "🚀 Démarrage de PHP-FPM..."
exec php-fpm
