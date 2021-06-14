FROM httpd:2.4

### Custom Apache configurations
COPY ./client/hfp-httpd.conf /usr/local/apache2/conf/httpd.conf

###
COPY ./hfp_kopavogur_is.crt /usr/local/apache2/conf/server.crt
COPY ./hfp_kopavogur_is.key /usr/local/apache2/conf/server.key

### Web files
COPY ./client/ /usr/local/apache2/htdocs/