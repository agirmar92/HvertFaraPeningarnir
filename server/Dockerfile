FROM ubuntu:14.04

###
COPY ./hfp_kopavogur_is.crt /root/server.crt
COPY ./hfp_kopavogur_is.key /root/server.key

RUN apt-get update && apt-get upgrade -y

RUN apt-get install curl -y

RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -

RUN apt-get install -y --force-yes nodejs && apt-get clean

WORKDIR /api

ADD server/package.json /api/package.json
ADD server/npm-shrinkwrap.json /api/npm-shrinkwrap.json
ADD server/index.js /api/src/index.js
ADD server/api.js /api/src/api.js

RUN npm install

EXPOSE 4000

CMD ["node", "src/index.js"]
