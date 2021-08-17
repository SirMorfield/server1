FROM debian:buster

RUN apt-get update && \
    apt-get install -qq -y rclone

COPY rclone.conf /root/.config/rclone/rclone.conf
COPY clone.sh .

CMD bash clone.sh
