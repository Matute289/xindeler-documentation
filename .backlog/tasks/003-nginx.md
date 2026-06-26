# 003 — VPS nginx config para docs.xindeler.greenmountain.dev

**Estado:** `[ ]` Pendiente  
**Prioridad:** Alta  
**Sprint:** 1  
**Dependencia:** 002 (CI/CD debe estar configurado primero)

## Qué hacer

En el VPS (`ssh -i ~/.ssh/id_ed25519 mgrinberg@216.238.126.97`):

### 1. Crear directorio de deploy
```bash
sudo mkdir -p /srv/xindeler/docs
sudo chown mgrinberg:mgrinberg /srv/xindeler/docs
```

### 2. nginx virtual host
Crear `/etc/nginx/sites-available/docs.xindeler.greenmountain.dev`:

```nginx
server {
    listen 80;
    server_name docs.xindeler.greenmountain.dev;
    
    root /srv/xindeler/docs;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    gzip on;
    gzip_types text/html text/css application/javascript application/json;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/docs.xindeler.greenmountain.dev \
           /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 3. SSL con certbot
```bash
sudo certbot --nginx -d docs.xindeler.greenmountain.dev
```

### 4. DNS
Agregar registro A `docs.xindeler.greenmountain.dev` → IP del VPS en el proveedor DNS.

## Acceptance criteria
- [ ] `https://docs.xindeler.greenmountain.dev` resuelve y muestra el portal
- [ ] SSL válido
- [ ] Push a main → deploy automático visible en producción
