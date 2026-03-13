# Stage 1: Build Angular UI
FROM node:22-alpine AS ui-build
WORKDIR /app
COPY smartpunch-ui/package*.json ./
RUN npm ci
COPY smartpunch-ui/ .
RUN npx ng build --configuration=production

# Stage 2: PHP API + Nginx serving UI
FROM php:8.4-cli

RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    zip unzip git curl \
    nginx \
    supervisor \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_pgsql pgsql gd bcmath \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install API
WORKDIR /app
COPY smartpunch-api/ /app/
RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader
RUN php artisan route:cache
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/app/public \
    && chmod -R 775 storage bootstrap/cache

# Copy built UI into nginx web root
COPY --from=ui-build /app/dist/smartpunch-ui/browser /var/www/html

# Nginx config: serve UI static files, proxy /api to Laravel
RUN cat > /etc/nginx/sites-available/default << 'EOF'
server {
    listen 80;
    server_name _;
    root /var/www/html;
    index index.html;

    # Proxy API requests to Laravel
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;
}
EOF

# Supervisor: run both nginx and Laravel in one container
RUN cat > /etc/supervisor/conf.d/smartpunch.conf << 'EOF'
[supervisord]
nodaemon=true
logfile=/dev/stdout
logfile_maxbytes=0

[program:nginx]
command=nginx -g "daemon off;"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:laravel]
command=php artisan serve --host=127.0.0.1 --port=8000
directory=/app
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
EOF

EXPOSE 80

CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
