# Utilise une image PHP avec extensions nécessaires
FROM php:8.2-fpm

# Installe les dépendances système (curl, git, zip, unzip, libzip, etc)
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

# Copie tout le code dans le conteneur
COPY . /var/www/html

WORKDIR /var/www/html

# Installe les dépendances PHP (sans dev pour prod)
RUN composer install --no-dev --optimize-autoloader

# Génère la clé Laravel (optionnel si déjà générée)
RUN php artisan key:generate

# Applique les migrations (base de données)
RUN php artisan migrate --force

# Donne les droits nécessaires
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose le port 9000 (PHP-FPM)
EXPOSE 9000

# Commande par défaut pour lancer PHP-FPM
CMD ["php-fpm"]
