FROM qmcgaw/youtube-dl-alpine

USER root
WORKDIR /root

RUN apk add --no-cache --update nodejs npm

COPY ./youtube-dl-takeout.js /root
ENTRYPOINT [ "node", "/root/youtube-dl-takeout.js" ]

#  docker build -t youtube-dl-takeout .
#  docker run -v $HOME/files/dump/youtube:/youtube/ --name youtube-dl-takeout youtube-dl-takeout
