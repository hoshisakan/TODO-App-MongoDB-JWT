FROM mongo:7.0.4

COPY init.d/mongo-init.js /docker-entrypoint-initdb.d/

CMD ["mongod", "--auth"]

# Path: todo-mongodb-jwt-service/conf/mongodb/init.d/mongo-init.js
