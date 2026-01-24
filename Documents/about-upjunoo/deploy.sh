#!/bin/bash

# Script de déploiement automatique pour about.upjunoo.com
# Exécuter avec: chmod +x deploy.sh && ./deploy.sh

set -e  # Arrêter le script en cas d'erreur

echo "🚀 Déploiement de about.upjunoo.com sur serveur ultron"
echo "=================================================="

# Variables de configuration
SERVER_USER="your-username"  # Remplacez par votre nom d'utilisateur
SERVER_HOST="ultron"         # Ou l'IP du serveur
PROJECT_NAME="about-upjunoo"
DOMAIN="about.upjunoo.com"
PORT=3001
PRODUCTION_PATH="/var/www/production"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

echo_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

echo_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Vérification de la connexion SSH
echo "🔍 Vérification de la connexion SSH..."
if ssh -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" "echo 'Connexion SSH réussie'" >/dev/null 2>&1; then
    echo_success "Connexion SSH établie avec $SERVER_HOST"
else
    echo_error "Impossible de se connecter à $SERVER_HOST"
    echo "Vérifiez vos identifiants SSH et la configuration du serveur"
    exit 1
fi

# Build local du projet
echo "🔨 Build local du projet..."
npm run build
echo_success "Build local terminé"

# Création du répertoire de production sur le serveur
echo "📁 Préparation du répertoire de production..."
ssh "$SERVER_USER@$SERVER_HOST" "
    sudo mkdir -p $PRODUCTION_PATH
    sudo chown \$USER:\$USER $PRODUCTION_PATH
    mkdir -p $PRODUCTION_PATH/$PROJECT_NAME
"
echo_success "Répertoire de production préparé"

# Synchronisation des fichiers
echo "📤 Synchronisation des fichiers vers le serveur..."
rsync -avz --exclude node_modules --exclude .git --delete \
    ./ "$SERVER_USER@$SERVER_HOST:$PRODUCTION_PATH/$PROJECT_NAME/"
echo_success "Fichiers synchronisés"

# Installation des dépendances et build sur le serveur
echo "📦 Installation des dépendances sur le serveur..."
ssh "$SERVER_USER@$SERVER_HOST" "
    cd $PRODUCTION_PATH/$PROJECT_NAME
    npm install --production
    npm run build
"
echo_success "Dépendances installées et projet buildé"

# Vérification du port disponible
echo "🔍 Vérification du port $PORT..."
ssh "$SERVER_USER@$SERVER_HOST" "
    if netstat -tlnp | grep :$PORT >/dev/null; then
        echo 'Port $PORT déjà utilisé, recherche d\'un port libre...'
        PORT=\$(python3 -c 'import socket; s=socket.socket(); s.bind((\"\", 0)); print(s.getsockname()[1]); s.close()')
        echo \"Nouveau port trouvé: \$PORT\"
    fi
"

# Arrêt de l'ancien processus s'il existe
echo "🔄 Gestion des processus PM2..."
ssh "$SERVER_USER@$SERVER_HOST" "
    if pm2 list | grep $PROJECT_NAME >/dev/null; then
        pm2 delete $PROJECT_NAME
        echo 'Ancien processus arrêté'
    fi
"

# Démarrage du nouveau processus
echo "🚀 Démarrage de l'application..."
ssh "$SERVER_USER@$SERVER_HOST" "
    cd $PRODUCTION_PATH/$PROJECT_NAME
    pm2 start npm --name '$PROJECT_NAME' -- start -- --port $PORT
    pm2 save
"
echo_success "Application démarrée sur le port $PORT"

# Configuration Nginx
echo "⚙️ Configuration de Nginx..."
ssh "$SERVER_USER@$SERVER_HOST" "
    sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_cache_bypass \\\$http_upgrade;
    }
}
EOF

    # Activation du site
    sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/

    # Test de la configuration
    sudo nginx -t

    # Rechargement de Nginx
    sudo systemctl reload nginx
"
echo_success "Configuration Nginx mise à jour"

# Configuration SSL avec Certbot
echo "🔒 Configuration SSL avec Certbot..."
ssh "$SERVER_USER@$SERVER_HOST" "
    sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@upjunoo.com
"
echo_success "SSL configuré avec succès"

# Vérifications finales
echo "🔍 Vérifications finales..."
ssh "$SERVER_USER@$SERVER_HOST" "
    echo 'État PM2:'
    pm2 status | grep $PROJECT_NAME || echo 'Aucun processus trouvé'

    echo 'Test Nginx:'
    sudo nginx -t

    echo 'Test SSL:'
    curl -I https://$DOMAIN || echo 'Site non encore accessible'
"

echo ""
echo_success "🎉 Déploiement terminé avec succès!"
echo "📝 Résumé:"
echo "   - Application: $PROJECT_NAME"
echo "   - Port: $PORT"
echo "   - Domain: https://$DOMAIN"
echo "   - Serveur: $SERVER_HOST"
echo ""
echo_warning "⚠️ N'oubliez pas de:"
echo "   1. Vérifier que le DNS pointe vers le serveur"
echo "   2. Tester l'application sur https://$DOMAIN"
echo "   3. Vérifier les logs avec: pm2 logs $PROJECT_NAME"
echo ""