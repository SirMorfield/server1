FROM debian:buster

RUN apt-get update

RUN apt-get install nginx -y

COPY nginx.conf /etc/nginx/sites-available/nginx.conf

RUN rm -rf /etc/nginx/sites-enabled/* && \
	ln -fs /etc/nginx/sites-available/nginx.conf /etc/nginx/sites-enabled/

EXPOSE 443
EXPOSE 80

ENTRYPOINT ["nginx", "-g", "daemon off;"]
