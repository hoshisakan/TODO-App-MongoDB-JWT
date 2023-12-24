FROM node:20.10 as base

# Add arguments to set timezone
ARG SERVER_TIME_ZONE
ARG SERVER_LANG_NAME
ARG SERVER_LANG_INPUTFILE
ARG SERVER_LANG_CHARMAP
ARG SERVER_POSTGRES_VERSION
ARG SERVER_POSTGRES_CLIENT_HOME
ARG SERVER_PACKAGES_PATH

# ENV SERVER_POSTGRES_CLIENT_HOME=${SERVER_POSTGRES_CLIENT_HOME}

# Set environment variable for postgresql-client specific version
ENV PATH=$SERVER_POSTGRES_CLIENT_HOME/bin:$PATH

# For install mongodb-org-shell and mongodb-org-tools packages
RUN wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor | tee /usr/share/keyrings/mongodb.gpg > /dev/null
RUN echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list

RUN apt-get update

# Install base packages, build-essential libreadline-dev zlib1g-dev for make install postgresql-client specific version
# Install libicu-dev pkgconf for install postgresql-client more than 15.2 version, such as 16.1 version
# Otherwise, it will show error message: configure: error: ICU library not found
RUN apt update && apt install -y wget locales gnupg2 apt-transport-https \
    ca-certificates curl software-properties-common \
    libnss3-tools iputils-ping telnet net-tools \
    openssl tzdata build-essential libreadline-dev zlib1g-dev \
    libicu-dev pkgconf mongodb-org-shell mongodb-org-tools

# Enter postgresql-client install package directory
# WORKDIR ${SERVER_PACKAGES_PATH}

# # Download postgresql-client specific version
# RUN wget https://ftp.postgresql.org/pub/source/v${SERVER_POSTGRES_VERSION}/postgresql-${SERVER_POSTGRES_VERSION}.tar.gz

# # Unzip postgresql-client specific version
# RUN tar -zxvf postgresql-${SERVER_POSTGRES_VERSION}.tar.gz -C ${SERVER_PACKAGES_PATH}

# # Enter postgresql-client specific version directory
# WORKDIR ${SERVER_PACKAGES_PATH}/postgresql-${SERVER_POSTGRES_VERSION}

# # Install postgresql-client specific version
# RUN ./configure --prefix=${SERVER_POSTGRES_CLIENT_HOME} && make && make install

# # Remove postgresql-client specific version install package files
# RUN rm -rf ${SERVER_PACKAGES_PATH}/postgresql-${SERVER_POSTGRES_VERSION}.tar.gz && rm -rf ${SERVER_PACKAGES_PATH}/postgresql-{$SERVER_POSTGRES_VERSION}

# Clean apt cache
RUN rm -rf /var/cache/apt && apt-get clean && rm -rf /var/lib/apt/lists/*

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