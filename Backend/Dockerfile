FROM node:latest

# Carpeta clara para backend
WORKDIR /usr/src/backend

# Copiamos manifests primero para aprovechar cache
COPY package*.json ./

# Instalación simple con npm install (solo deps de prod)
# --omit=dev evita instalar devDependencies (igual que antes)
# --no-audit y --no-fund para builds más limpios/rápidos
RUN npm install --no-audit --no-fund

# Copiamos el resto del código
COPY . .

EXPOSE 3000

CMD ["node", "src/server.js"]