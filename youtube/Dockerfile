FROM ubuntu:latest

USER root
WORKDIR /root

RUN apt-get update && apt-get install -y python3 curl
RUN ln -s /usr/bin/python3 /usr/bin/python

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - &&\
	apt-get install -y nodejs

RUN curl -L https://yt-dl.org/downloads/latest/youtube-dl -o /usr/local/bin/youtube-dl
RUN chmod a+rx /usr/local/bin/youtube-dl

COPY ./youtube-dl-takeout.js /root
ENTRYPOINT [ "node", "/root/youtube-dl-takeout.js" ]

#  docker build -t youtube-dl-takeout .
#  docker run -v $HOME/files/dump/youtube:/youtube/ --name youtube-dl-takeout youtube-dl-takeout
