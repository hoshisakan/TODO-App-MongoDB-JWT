# TODO-App-MongoDB-JWT
## About
Drag Todo List: The complete guide to building an app use Node.js Express (with JavaScript), React 18.2 (with Typescript) and Mobx and docker containers, and deploy it to the cloud.

## Use Docker to build the following services
* Node.js 20.10 as builder + Nginx 1.25.3 (Frontend)
* Node.js 20.10 as base + development || production environment (Backend)
* Redis 7.2.3 (Cache)
* MongoDB 7.0.4 (Database)
* mongo-express 1.0.2-20 (Database Management)

## Live Demo
https://dragtodo.serveirc.com/

* Test user account and password or your can through Google account to login
```
    Email: halawey822@glaslack.com
    Password: 12345678a
```

# Project Description

## Website structure
[Frontend Package Relative Link](./todo-mongodb-jwt-service/web/frontend/todo-client-app/pnpm-lock.yaml)
* Frontend: React + Mobx + Mobx-React-Lite + Axios + React Router + React Toastify + Bootstrap + React Beautiful DND React Icons + Typescript

[Backend Package Relative Link](./todo-mongodb-jwt-service/web/backend/node-js-jwt-auth-mongodb/pnpm-lock.yaml)
* Backend: Node.js + Express + MongoDB + Mongoose + JSON Web Token + MOMENT + DotEnv + Cors + Bcryptjs + Nodemon + Typescript + Winston + Winston-Daily-Rotate-File + Redis + Cookie-Parser + Child-Process + Nodemailer + Node-Cron

* Database: MongoDB + Redis

* Proxy: Nginx + SSL

* DevOps: Docker + Docker-Compose + Docker-Config + Docker-Volume + Docker-Network + Docker-Service + Docker-Container + Docker-Image

## Features
### Home page (Not login)
* Apply normal login

![Home page (Not login)](https://imgur.com/pQJQquZ.png)

* Register account

![Register page](https://imgur.com/NN1BpiI.png)

> Note: You can use the following website to get a temporary email address
```
https://10minemail.com/en/
```

* Forget password

![Forget password page](https://imgur.com/EoHtdFd.png)

### Home page (Login)
* Show all todo list

![Show all todo list 1](https://imgur.com/SsIlkMg.png)

![Show all todo list 2](https://imgur.com/LCpTym0.png)

* Add new todo list

![Add new todo list](https://imgur.com/lSHtH6S.png)

* Edit todo list

![Edit todo list](https://imgur.com/9dSUZHb.png)

* Delete todo list

![Delete todo list](https://imgur.com/JxLEmUd.png)

* Drag and drop todo list

### User profile page
* Display user information

![User profile page 1](https://imgur.com/swz8rm3.png)

![User profile page 2](https://imgur.com/Xz3hB1l.png)

* Change user information

![Change user information 1](https://imgur.com/Jveb2mW.png)

![Change user information 2](https://imgur.com/0xxYUDy.png)

## Data Backup Schedule
* Backup MongoDB data every day at 00:60 (Child Process + Node Cron)
CRON_EXPRESSION='*/60 * * * *' # Every 60 minutes

# Development Environment Setup

## Management Docker containers with Docker Compose
* Start: `docker-compose --env-file=config.env up -d`
* Stop: `docker-compose down`
* Rebuild: `docker-compose --env-file=config.env up -d --build`

## Build Docker Containers with docker-compose.yml
* docker-compose.yml
```
version: '3.9'

services:
    cache:
        build:
            context: ./conf/redis
            dockerfile: Dockerfile
        image: ${CONTAINER_AUTHOR}/${SERVICE_NAME}_redis
        container_name: ${REDIS_CONTAINER_NAME}
        environment:
            TZ: ${TZ}
        env_file:
            - ${ENV_FILE_PATH}
        volumes:
            - ./data/redis:/data
            - ./logs/redis:/var/log
        ports:
            - ${REDIS_OUTER_PORT}:${REDIS_INNER_PORT}
        networks:
            todo_mongodb_jwt_net:
                ipv4_address: ${REDIS_HOST_IP}
        command: redis-server --appendonly ${REDIS_AOF_ENABLED} --requirepass ${REDIS_PASSWORD}
        restart: always

    reverse_proxy:
        build:
            context: ./web/frontend
            dockerfile: Dockerfile
            args:
                - NGINX_TIME_ZONE=${NGINX_TIME_ZONE}
                - NGINX_LANG_NAME=${NGINX_LANG_NAME}
                - NGINX_LANG_INPUTFILE=${NGINX_LANG_INPUTFILE}
                - NGINX_LANG_CHARMAP=${NGINX_LANG_CHARMAP}
                - DEBIAN_FRONTEND=${NGINX_DEBIAN_FRONTEND}
        image: ${CONTAINER_AUTHOR}/${SERVICE_NAME}_nginx
        container_name: ${REVERSE_PROXY_CONTAINER_NAME}
        volumes:
            - ./web/frontend/nginx/nginx.conf:/etc/nginx/nginx.conf
            - ./web/frontend/nginx/conf.d:/etc/nginx/conf.d
            - ./web/frontend/certs/ssl:/etc/nginx/ssl
            - ./web/frontend/certs/data:/usr/share/nginx/html/letsencrypt/
            - ./logs/nginx:/var/log/nginx
        env_file:
            - ${ENV_FILE_PATH}
        environment:
            - LANG=${NGINX_LANG_NAME}
        ports:
            - ${REVERSE_PROXY_HTTP_EXPOSE_PORT}:${REVERSE_PROXY_HTTP_INNER_PORT}
            - ${REVERSE_PROXY_HTTPS_EXPOSE_PORT}:${REVERSE_PROXY_HTTPS_INNER_PORT}
        networks:
            todo_mongodb_jwt_net:
                ipv4_address: ${REVERSE_PROXY_HOST_IP}
        depends_on:
            - cache
            - server
            - mongodb
        tty: true
        restart: always

    server:
        build:
            context: ./web/backend/node-js-jwt-auth-mongodb
            # target: dev
            target: production
            args:
                - SERVER_TIME_ZONE=${TZ}
                - SERVER_LANG_NAME=${LANG_NAME}
                - SERVER_LANG_INPUTFILE=${LANG_INPUTFILE}
                - SERVER_LANG_CHARMAP=${LANG_CHARMAP}
                - SERVER_POSTGRES_VERSION=${POSTGRES_VERSION}
                - SERVER_POSTGRES_CLIENT_HOME=${SERVER_POSTGRES_CLIENT_HOME}
                - SERVER_PACKAGES_PATH=${SERVER_PACKAGES_PATH}
        image: ${CONTAINER_AUTHOR}/${SERVICE_NAME}_server
        container_name: ${SERVER_CONTAINER_NAME}
        volumes:
            - ./web/deploy/img:/app/upload/photo
            - ./data_backup:/app/data_backup
            - ./logs/server:/var/log
        env_file:
            - ${ENV_FILE_PATH}
        ports:
            - ${SERVER_OUTER_PORT}:${SERVER_INNER_PORT}
        networks:
            todo_mongodb_jwt_net:
                ipv4_address: ${SERVER_HOST_IP}
        depends_on:
            - mongodb
        tty: true
        restart: always

    mongodb:
        build:
            context: ./conf/mongodb
            dockerfile: Dockerfile
        image: ${CONTAINER_AUTHOR}/${SERVICE_NAME}_mongodb
        container_name: ${MONGO_CONTAINER_NAME}
        restart: always
        environment:
            MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
            MONGO_INITDB_ROOT_PASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
            MONGO_INITDB_DATABASE: ${MONGO_INITDB_DATABASE}
            TZ: ${TZ}
        env_file:
            - ${ENV_FILE_PATH}
        volumes:
            - ./data/mongodb/db:/data/db
            # - ./conf/mongodb/mongod.conf:${MONGO_INNER_CONFIG_PATH}
            - ./logs/mongodb:/var/log/mongodb

        ports:
            - ${MONGO_OUTER_PORT}:${MONGO_INNER_PORT}
        networks:
            todo_mongodb_jwt_net:
                ipv4_address: ${MONGO_HOST_IP}

    mongodb-express:
        build:
            context: ./conf/mongodb-express
            dockerfile: Dockerfile
        image: ${CONTAINER_AUTHOR}/${SERVICE_NAME}_mongodb-express
        container_name: ${MONGO_EXPRESS_CONTAINER_NAME}
        restart: always
        environment:
            ME_CONFIG_MONGODB_ADMINUSERNAME: ${MONGO_INITDB_ROOT_USERNAME}
            ME_CONFIG_MONGODB_ADMINPASSWORD: ${MONGO_INITDB_ROOT_PASSWORD}
            ME_CONFIG_MONGODB_SERVER: ${MONGO_HOST_IP}
            ME_CONFIG_MONGODB_PORT: ${MONGO_INNER_PORT}
            ME_CONFIG_MONGODB_AUTH_DATABASE: ${MONGO_EXPRES_AUTH_DATABASE}
            ME_CONFIG_BASICAUTH_USERNAME: ${MONGO_EXPRESS_USERNAME}
            ME_CONFIG_BASICAUTH_PASSWORD: ${MONGO_EXPRESS_PASSWORD}
        env_file:
            - ${ENV_FILE_PATH}
        ports:
            - ${MONGO_EXPRESS_OUTER_PORT}:${MONGO_EXPRESS_INNER_PORT}
        depends_on:
            - mongodb
        networks:
            todo_mongodb_jwt_net:
                ipv4_address: ${MONGO_EXPRESS_HOST_IP}

networks:
    todo_mongodb_jwt_net:
        driver: bridge
        ipam:
            config:
                - subnet: ${NETWORK_SUBNET}
                  gateway: ${NETWORK_GATEWAY}
```

# Website runtime environment
* Ubuntu 22.04
* Nginx 1.25.3
* Node.js 20.10
* Redis 7.2.3
* MongoDB 7.0.4
* mongo-express 1.0.2-20