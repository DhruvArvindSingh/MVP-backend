# Docker Deployment Guide

This document provides instructions for deploying the application using Docker and Docker Compose.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Overview

The deployment setup consists of two main services defined in `docker-compose.yml`:
1.  `postgres`: A PostgreSQL database container.
2.  `app`: The Node.js application container.

### Dockerfile

The `Dockerfile` defines the steps to build the application's Docker image:
1.  **Base Image**: It starts from the official `node:18-alpine` image.
2.  **Working Directory**: Sets `/app` as the working directory inside the container.
3.  **Dependencies**: Copies `package.json` and `package-lock.json` and installs dependencies with `npm install`.
4.  **Application Code**: Copies the rest of the application source code into the image.
5.  **Build**: Compiles the TypeScript code into JavaScript with `npm run build`.
6.  **Expose Port**: Exposes port `3000`, which is the port the application runs on.
7.  **Run Command**: The container will run `npm run start:prod` to start the application.

### docker-compose.yml

The `docker-compose.yml` file orchestrates the services:

-   **`postgres` service**:
    -   Uses the `postgres:15-alpine` image.
    -   Sets up the database with the user `myuser`, password `mypassword`, and database name `mydatabase`.
    -   Maps port `5432` on the host to port `5432` in the container.
    -   Uses a named volume `postgres_data` to persist database data.
    -   Includes a healthcheck to ensure the database is ready before the application starts.

-   **`app` service**:
    -   Builds the Docker image using the `Dockerfile` in the current directory.
    -   Maps port `3000` on the host to port `3000` in the container.
    -   Sets the `DATABASE_URL` environment variable to connect to the `postgres` service.
    -   Depends on the `postgres` service, ensuring it only starts after the database is healthy.
    -   `restart: unless-stopped` policy ensures the container restarts automatically unless manually stopped.

## Deployment Steps

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Create .env and add all environment variables**
    ```bash
    nano .env
    ```

3.  **Build and run the containers**:
    Use Docker Compose to build the images and start the services in detached mode.
    ```bash
    docker-compose up -d --build
    ```
    -   `up`: Creates and starts containers.
    -   `-d`: Runs containers in the background (detached mode).
    -   `--build`: Forces a build of the application image before starting.

4.  **Verify the services are running**:
    Check the status of the containers. You should see both `mvp-postgres` and `mvp-backend` with a status of `Up`.
    ```bash
    docker-compose ps
    ```

5.  **Check logs** (optional):
    To view the logs for a specific service:
    ```bash
    docker-compose logs app
    docker-compose logs postgres
    ```
    Use the `-f` flag to follow the logs in real-time.

6.  **Stop the application**:
    To stop and remove the containers, networks, and volumes created by `docker-compose up`:
    ```bash
    docker-compose down
    ```
    If you want to remove the `postgres_data` volume as well (deleting all database data), add the `-v` flag:
    ```bash
    docker-compose down -v
    ```
