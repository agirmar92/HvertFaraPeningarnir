FROM httpd:2.4

### Custom Apache configurations
COPY ./hfp-httpd.conf /usr/local/apache2/conf/httpd.conf

###
COPY server.ctr /usr/local/apache2/conf/server.ctr
COPY server.key /usr/local/apache2/conf/server.key
COPY server.ca-bundle /usr/local/apache2/conf/server.ca-bundle

### Web files
COPY ./ /usr/local/apache2/htdocs/