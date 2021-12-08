FROM node:16.13.0

MAINTAINER yubeenpark <yoobinpark@gmail.com>

WORKDIR /src

COPY package* json ./

RUN npm install

EXPOSE 3000

 