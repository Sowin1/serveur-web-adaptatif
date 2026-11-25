#!/usr/bin/env bash
set -Eeuo pipefail

if [[ $EUID -ne 0 ]]; then
    echo "Erreur : initInstall.sh doit être lancé par installation.sh avec sudo"
    exit 1
fi

NODE_PATH="$(command -v node)"

# Move environment file

mv "$INSTALLATION_DIR/.env" "$PROJECT_DIR/.env"
cd "$PROJECT_DIR"

# Build project

pnpm --filter frontend build
pnpm --filter backend build

# Configure backend systemd service

tee /etc/systemd/system/backend.service > /dev/null <<EOF
[Unit]
Description=NestJS Backend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR/backend
ExecStart=$NODE_PATH dist/main.js
Environment=NODE_ENV=production
EnvironmentFile=$PROJECT_DIR/.env
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Configure frontend systemd service

tee /etc/systemd/system/frontend.service > /dev/null <<EOF
[Unit]
Description=NextJS Frontend
After=network.target backend.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$PROJECT_DIR/frontend
ExecStart=$NODE_PATH node_modules/next/dist/bin/next start -p 3001 -H 127.0.0.1
Environment=NODE_ENV=production
EnvironmentFile=$PROJECT_DIR/.env
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Start services

systemctl daemon-reload
systemctl enable --now backend frontend
systemctl restart backend frontend

# Configure Nginx reverse proxy

tee /etc/nginx/sites-available/$USER > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable Nginx configuration

ln -sfn /etc/nginx/sites-available/$USER \
    /etc/nginx/sites-enabled/$USER

rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable --now nginx
systemctl reload nginx

# Cleaning

rm -rf installation/ \
    installation.sh

cd serveur-web-adapatif/

rm -rf backend/src \
       backend/test \
       backend/nest-cli.json \
       backend/playwright.config.ts \
       backend/tsconfig.build.json \
       backend/tsconfig.build.tsbuildinfo \
       backend/tsconfig.json \
       backend/vitest.config.e2e.ts \
       backend/vitest.config.ts

rm -rf frontend/app \
       frontend/component \
       frontend/AGENTS.md \
       frontend/CLAUDE.md \
       frontend/README.md \
       frontend/eslint.config.mjs \
       frontend/postcss.config.mjs \
       frontend/next-env.d.ts