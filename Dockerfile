FROM --platform=linux/amd64 debian:bookworm
# важно указать платформу в случае работы на ARM процессоре

WORKDIR /app

RUN apt update
RUN apt install wget make gcc xz-utils rsync -y
RUN wget https://github.com/redis/redis/archive/7.0.12.tar.gz
RUN wget https://nodejs.org/dist/v18.17.0/node-v18.17.0-linux-x64.tar.xz
RUN tar xvf node-v18.17.0-linux-x64.tar.xz
WORKDIR /app/node-v18.17.0-linux-x64
RUN rsync -ar . /usr
WORKDIR /app

RUN tar xvf 7.0.12.tar.gz
WORKDIR /app/redis-7.0.12

RUN make
RUN make install

# при необходимости скопировать код из других поддиректорий 
# и вспомогательные файлы

WORKDIR /app

COPY ./package.json .
RUN npm install
COPY ./app.js .
COPY ./model/ ./model/
COPY ./public/ ./public/
COPY .env .
CMD [ "node", "app.js" ]
