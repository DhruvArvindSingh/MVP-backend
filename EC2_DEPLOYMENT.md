# EC2 Deployment Guide

This document provides instructions for deploying the application on an AWS EC2 instance. The steps are based on the `ec2.sh` and `setup_postgres.sh` scripts.

## 1. Initial Server Setup

These commands set up the basic environment required for the application.

### 1.1. Update Package Manager

It's good practice to update the package list before installing new software.
```bash
sudo apt update
```

### 1.2. Install git

```bash
sudo apt install git
```

### 1.3. Install git

```bash
git clone https://github.com/DhruvArvindSingh/MVP-backend
cd MVP-backend
```

## 2.1 Setup Project

Add all the environment variables in .env file

```bash
nano .env
```

The `ec2.sh` script automates the project setup.

First, make the script executable:
```bash
chmod +x ec2.sh
```
Then, run the script. You might need `sudo` if you are not running as root.
```bash
./ec2.sh
```

This script will:
1.  Install nodejs and npm from nvm
2.  Install pm2
3.  Install all the dependencies
4.  Allow executable access to start_postgres.sh
5.  Build the project


## 2.2 Setup Database

The `start_postgres.sh` script automates the database setup.

Once more, make the script executable:
```bash
chmod +x start_postgres.sh
```
Then, run the script. You might need `sudo` if you are not running as root.
```bash
./setup__postgres.sh
```

This script will:
1.  Start and enable the `postgresql` service.
2.  Create a PostgreSQL user named `myuser` with the password `mypassword`.
3.  Create a database named `mydatabase` owned by `myuser`.
4.  Grant all privileges on the database to the user.
5.  Test the connection to the database.

**Note:** You can modify the script to change the user, password, and database name.


## 3. Start the Application

Once the application is built (the `npm run build` command), you can start it with `pm2`. Assuming the built entry point is in `dist/index.js`:
```bash
pm2 start npm --name "mvp-backend" -- run start:prod
```
You can replace `mvp-backend` with your desired application name.

Here are some common `pm2` commands:
- `pm2 list`: List all running applications.
- `pm2 stop my-app`: Stop the application.
- `pm2 restart my-app`: Restart the application.
- `pm2 logs my-app`: View application logs.
- `pm2 startup` & `pm2 save`: To make the application start on server reboot.

## 4. Nginx Deployment

Install all the dependencies

```bash
sudo apt update
sudo apt install nginx -y
```

Check if Nginx is running:

```bash
systemctl status nginx
```

Create nginx.conf in your-domain.com:

```bash
sudo nano /etc/nginx/sites-available/your-domain.fun
```

Paste this configuration( Replace your-domain.com with your domain):

```bash
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable to config

```bash
sudo ln -s /etc/nginx/sites-available/mvp-be.dsingh.fun /etc/nginx/sites-enabled/
```

Test Nginx config:
```bash
sudo nginx -t
```

Reload Nginx:
```bash
sudo systemctl reload nginx
```

## 5. Setting SSL Certificate

Install Certbot and Nginx plugin:
```bash
sudo apt install certbot python3-certbot-nginx -y
```

Get SSL Certificate
```bash
sudo certbot --nginx -d your-domain.com
```

Auto-Renew SSL
```bash
sudo certbot renew --dry-run
```

