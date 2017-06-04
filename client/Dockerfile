FROM httpd:2.4

### Custom Apache configurations
COPY ./hfp-httpd.conf /usr/local/apache2/conf/httpd.conf

###
COPY /var/jenkins_home/server.ctr /usr/local/apache2/conf/server.ctr
COPY /var/jenkins_home/server.key /usr/local/apache2/conf/server.key
COPY /var/jenkins_home/server.ca-bundle /usr/local/apache2/conf/server.ca-bundle

### Web files
COPY ./ /usr/local/apache2/htdocs/