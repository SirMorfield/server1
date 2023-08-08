FROM ubuntu:latest

USER root
WORKDIR /root

RUN apt-get update && apt-get install -y python3 curl ffmpeg
RUN ln -s /usr/bin/python3 /usr/bin/python

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - &&\
	apt-get install -y nodejs

RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp
RUN chmod a+rx /usr/local/bin/yt-dlp

COPY ./youtube-dl-takeout.js /root
ENTRYPOINT [ "node", "/root/youtube-dl-takeout.js" ]

#  docker build -t youtube-dl-takeout .
#  docker run -v $HOME/files/dump/youtube:/youtube/ --name youtube-dl-takeout youtube-dl-takeout
