FROM qmcgaw/youtube-dl-alpine

USER root
WORKDIR /root

RUN apk add --no-cache --update nodejs npm

COPY ./youtube-dl-takeout.js /root
ENTRYPOINT [ "node", "/root/youtube-dl-takeout.js" ]
