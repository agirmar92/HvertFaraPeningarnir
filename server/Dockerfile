FROM ubuntu:14.04

RUN mkdir /root/.ssh/

###
COPY ./server.crt ~/.ssh/server.crt
COPY ./server.key ~/.ssh/server.key
COPY ./server.ca-bundle ~/.ssh/server.ca-bundle

RUN apt-get update && apt-get upgrade -y

RUN apt-get install curl -y

RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -

RUN apt-get install -y nodejs && apt-get clean

WORKDIR /api

ADD server/package.json /api/package.json
ADD server/index.js /api/src/index.js
ADD server/api.js /api/src/api.js

RUN npm install

EXPOSE 4000

CMD ["node", "src/index.js"]