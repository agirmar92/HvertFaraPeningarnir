FROM httpd:2.4

### Custom Apache configurations
COPY ./client/hfp-httpd.conf /usr/local/apache2/conf/httpd.conf

###
COPY ./server.crt /usr/local/apache2/conf/server.crt
COPY ./server.key /usr/local/apache2/conf/server.key
COPY ./server.ca-bundle /usr/local/apache2/conf/server.ca-bundle

### Web files
COPY ./client/ /usr/local/apache2/htdocs/