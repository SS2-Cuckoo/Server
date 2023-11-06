FROM node:14

WORKDIR /usr/src/app

ENV DOCKERIZE_VERSION v0.6.1

COPY package*.json /
COPY .env /.env
COPY . .

RUN npm install

EXPOSE 8081

RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

RUN chmod +x docker-entrypoint.sh  
ENTRYPOINT ./docker-entrypoint.sh