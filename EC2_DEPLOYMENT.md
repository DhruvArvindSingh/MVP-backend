# EC2 Deployment Guide

This document provides instructions for deploying the application on an AWS or GCP VM instance. the VM's OS should Ubuntu or Debian

## 1. Initial Server Setup

These commands set up the basic environment required for the application.

### 1.1. Update Package Manager

It's good practice to update the package list before installing new software.
```bash
sudo apt update
```

### 1.2. Install git

If the VM is ran on the Google provider then the git is not preinstalled.In AWS, git comes preinstalled so ran the below command it you are using GCP

```bash
sudo apt install git
```

### 1.3. Install git

```bash
git clone https://github.com/DhruvArvindSingh/MVP-backend
cd MVP-backend
```

### 1.3. Install git

Install npm/node version 22.16.0 via nvm 

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash && source ~/.bashrc && nvm list-remote && nvm install v22.16.0
```

## 2.1 Setup Project

The `ec2.sh` script automates the project setup.

First, make the script executable:
```bash
chmod +x ec2.sh
```
Then, run the script. You might need `sudo` if you are not running as root.

This script will:
1.  Install nodejs and npm from nvm
2.  Install pm2
3.  Install all the dependencies
4.  Allow executable access to start_postgres.sh
5.  Build the project

```bash
./ec2.sh
```

## 2.2 Setup Postgres Database

**Note:** You can skip this step if you are using external Postgres database

**Note:** You can modify the script to change the user, password, and database name. default link is `postgresql://myuser:mypassword@localhost:5432/mydatabase`

If you want to run the postgres database inside the VM then run the `setup_postgres.sh` bash script. 
The `setup_postgres.sh` script automates the postgres database setup.

You might need `sudo` if you are not running as root.
```bash
./setup_postgres.sh
```

This script will:
1.  Start and enable the `postgresql` service.
2.  Create a PostgreSQL user named `myuser` with the password `mypassword`.
3.  Create a database named `mydatabase` owned by `myuser`.
4.  Grant all privileges on the database to the user.
5.  Test the connection to the database.
6.  You will need to upgrade the `POSTGRES_DATABASE_LINK` inside the .env file with the following link : `postgresql://myuser:mypassword@localhost:5432/mydatabase`


## 2.3 Setup MongoDB Database

**Note:** You can skip this step if you are using external MongoDB database

**Note:** You can modify the script to change the user, password, and database name. default link is `mongodb://username:password@localhost:27017/database_name?authSource=admin`


If you want to run the mongodb database inside the VM then run the `setup_mongodb.sh` bash script. 
The `setup_mongodb.sh` script automates the mongodb database setup.

You might need `sudo` if you are not running as root.
```bash
./setup_mongodb.sh
```

This script will:
1.  Install MongoDB (series 7.0 or 6.0) on Ubuntu or Debian 12 (bookworm).
2.  Configure mongod with authentication enabled, bound to 127.0.0.1 on port 27017.
3.  Enable and start the mongod service.
4.  Create an admin user (admin / StrongAdminP@ssw0rd by default) with full root privileges.
5.  Create an application database (database_name) and an application user (username / password) with readWrite privileges on that database.
6.  Verify connectivity by testing a ping command against the application database using the new user credentials.
7. You will need to upgrade the `MONGO_DATABASE_LINK` inside the .env file with the following link: : `mongodb://username:password@localhost:27017/database_name?authSource=admin`

## 2.3 Create and Push the prisma schema in Postgres and MongoDB Database

```bash
./push_schema.sh
```

This script will:
1.  Generate the generate folder from the .prisma file
2.  Pushes the table schema in the postgres database
3.  Pushes the table schema in the mongodb database


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

**Note:** You need to change the `your-domain.com` in the below configuration to you own domain name which is pointing to your VM's external IP.

Paste this configuration

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

**Note:** You need to change the `your-domain.com` in the below configuration to you own domain name which is pointing to your VM's external IP.

```bash
sudo certbot --nginx -d your-domain.com
```

Auto-Renew SSL
```bash
sudo certbot renew --dry-run
```

