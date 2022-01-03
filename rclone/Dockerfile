FROM debian:buster

RUN apt-get update && \
    apt-get install -qq -y curl p7zip-full

RUN curl https://rclone.org/install.sh |  bash

COPY rclone.conf /root/.config/rclone/rclone.conf
COPY clone.sh .

CMD bash clone.sh
