#!/bin/bash
docker stop todo_mongodb_jwt_server todo_mongodb_jwt_reverse_proxy
docker container rm todo_mongodb_jwt_server todo_mongodb_jwt_reverse_proxy
docker image rm hoshisakan/todo_mongodb_jwt_nginx hoshisakan/todo_mongodb_jwt_server
docker compose --env-file=config.env up -d --build