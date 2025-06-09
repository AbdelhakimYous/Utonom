# Utilise une image PHP avec extensions nécessaires
FROM php:8.2-fpm

# Installe les dépendances système
RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    && docker-php-ext-configure zip \
    && docker-php-ext-install zip pdo_mysql mbstring exif pcntl bcmath gd

# Installe Composer globalement
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Copie le code source dans le conteneur
COPY . /var/www/html

# Copie le .env.example vers .env (IMPORTANT)
COPY .env.example /var/www/html/.env

WORKDIR /var/www/html

# Installe les dépendances PHP (sans dev)
RUN composer install --no-dev --optimize-autoloader

# Copie le script de démarrage dans le conteneur
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Donne les droits nécessaires
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose le port 9000 (PHP-FPM)
EXPOSE 9000

# Utilise le script start.sh comme commande par défaut
CMD ["/start.sh"]

