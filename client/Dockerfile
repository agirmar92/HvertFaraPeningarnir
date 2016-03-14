FROM ubuntu:14.04

RUN apt-get update && apt-get upgrade -y

RUN apt-get install curl -y

RUN curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -

RUN apt-get install -y nodejs && apt-get clean

RUN apt-get install -y python python-dev python-distribute python-pip

RUN npm install -g bower

RUN apt-get install -y git

WORKDIR /app

ADD package.json /app/package.json
ADD bower.json /app/bower.json
ADD index.html /app/index.html
ADD fav.ico /app/fav.ico
ADD koplogo.gif /app/koplogo.gif
ADD js /app/js
ADD fonts /app/fonts
ADD css /app/css

RUN npm install

RUN bower install --allow-root

EXPOSE 8000

CMD ["python", "-m", "SimpleHTTPServer", "8000"]
