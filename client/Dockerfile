FROM httpd:2.4

### Custom Apache configurations
COPY ./client/hfp-httpd.conf /usr/local/apache2/conf/httpd.conf

### Web files
COPY ./client/ /usr/local/apache2/htdocs/
