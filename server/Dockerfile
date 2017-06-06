FROM ubuntu:14.04


RUN apt-get update && apt-get upgrade -y

RUN apt-get install curl -y

RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -

RUN apt-get install -y nodejs && apt-get clean

WORKDIR /api

###
ADD ./server.crt /api/ssl/server.crt
ADD ./server.key /api/ssl/server.key
ADD ./server.ca-bundle /api/ssl/server.ca-bundle

ADD server/package.json /api/package.json
ADD server/index.js /api/src/index.js
ADD server/api.js /api/src/api.js

RUN npm install

EXPOSE 4000

CMD ["node", "src/index.js"]