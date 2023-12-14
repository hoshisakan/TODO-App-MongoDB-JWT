FROM node:20.10 as base

# Add arguments to set timezone
ARG SERVER_TIME_ZONE
ARG SERVER_LANG_NAME
ARG SERVER_LANG_INPUTFILE
ARG SERVER_LANG_CHARMAP

# For install mongodb-org-shell and mongodb-org-tools packages
RUN wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor | tee /usr/share/keyrings/mongodb.gpg > /dev/null
RUN echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

RUN apt-get update

# RUN apt install -y locales default-mysql-client default-libmysqlclient-dev iputils-ping mongodb-org-shell mongodb-org-tools
RUN apt install -y locales iputils-ping mongodb-org-shell mongodb-org-tools
# RUN apt install -y locales iputils-ping

RUN rm -rf /var/cache/apk/*

# Set timezone to Asia/Taipei
RUN ln -sf /usr/share/zoneinfo/${SERVER_TIME_ZONE} /etc/localtime

# Reset tzdata software package let user set timezone take effect
RUN dpkg-reconfigure -f noninteractive tzdata

# Set locale to specified language
RUN localedef -i ${SERVER_LANG_INPUTFILE} -c -f ${SERVER_LANG_CHARMAP} -A /usr/share/locale/locale.alias ${SERVER_LANG_NAME}

RUN mkdir -p /app

WORKDIR /app

COPY . /app

RUN npm install npm@latest -g && npm install nodemon -g && npm install pm2 -g && npm install pnpm -g

RUN rm -rf node_modules

RUN pnpm i --frozen-lockfile

FROM base as dev

ENV NODE_ENV=development

# RUN npm config set registry https://registry.npmjs.com/

CMD ["npm", "run", "start:dev"]

FROM base as production

ENV NODE_ENV=production

RUN pnpm i --frozen-lockfile

# CMD ["npm", "run", "start"]
CMD ["pm2-runtime", "start", "server.js"]