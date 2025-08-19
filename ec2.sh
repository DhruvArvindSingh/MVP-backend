curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash && source ~/.bashrc && nvm list-remote && nvm install v22.16.0

sudo apt update

sudo apt install nginx -y

npm i -g pm2

npm i 

npm run build

pm2 start npm --name "mvp-backend" -- run start:prod

sudo tee /etc/nginx/sites-available/mvp-be.dsingh.fun > /dev/null <<'EOF'
server {
    listen 80;
    server_name mvp-be.dsingh.fun;

    location / {
        proxy_pass http://127.0.0.1:3000;   # Forward traffic to Node.js app
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

sudo ln -s /etc/nginx/sites-available/mvp-be.dsingh.fun /etc/nginx/sites-enabled/

sudo nginx -t
sudo systemctl reload nginx

sudo apt install certbot python3-certbot-nginx -y

sudo certbot --nginx -d mvp-be.dsingh.fun \
  --non-interactive \
  --agree-tos \
  -m dsingh19072005@gmail.com \
  --redirect

sudo certbot renew --dry-run