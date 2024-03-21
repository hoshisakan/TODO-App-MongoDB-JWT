FROM node:20.10 as builder

ENV NODE_ENV=${CLIENT_NODEJS_ENV}

RUN mkdir -p /usr/src/app

# setting working directory
WORKDIR /usr/src/app

COPY /todo-client-app/ /usr/src/app/

# RUN rm -rf /usr/src/app/build && rm -rf /usr/src/app/dist && rm -rf /usr/src/app/node_modules

RUN rm -rf /usr/src/app/build && rm -rf /usr/src/app/dist && rm -rf /usr/src/app/node_modules

RUN npm install npm@latest -g && npm install -g pnpm

RUN pnpm i --frozen-lockfile

RUN pnpm run build

RUN mv /usr/src/app/build /usr/src/app/dist

FROM nginx:1.25.3

# Add arguments to set timezone
ARG NGINX_TIME_ZONE
ARG NGINX_LANG_NAME
ARG NGINX_LANG_INPUTFILE
ARG NGINX_LANG_CHARMAP
ARG DEBIAN_FRONTEND

# update nginx html
RUN rm -rf /usr/share/nginx/html
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Install base packages
RUN apt update
RUN apt install -y locales wget gnupg2 apt-transport-https \
    ca-certificates curl software-properties-common \
    libnss3-tools iputils-ping telnet net-tools

# Set timezone to Asia/Taipei
RUN ln -sf /usr/share/zoneinfo/${NGINX_TIME_ZONE} /etc/localtime
# Reset tzdata software package let user set timezone take effect
RUN dpkg-reconfigure -f noninteractive tzdata

# Set locale to specified language
RUN localedef -i ${NGINX_LANG_INPUTFILE} -c -f ${NGINX_LANG_CHARMAP} -A /usr/share/locale/locale.alias ${NGINX_LANG_NAME}

# Clear package lists
RUN rm -rf /var/lib/apt/lists/*

WORKDIR /usr/share/nginx/dist