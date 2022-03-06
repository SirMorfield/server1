FROM alpine:edge

RUN apk add --update \
    samba=4.15.5-r1 \
    && rm -rf /var/cache/apk/*

EXPOSE 445/tcp

# TODO: do all the things better
RUN adduser -s /sbin/nologin -h /home/samba -H -D joppe
RUN echo -e "INJECT_SMBPASSWD\nINJECT_SMBPASSWD" | smbpasswd -a -s joppe

ENTRYPOINT ["smbd", "--foreground", "--debug-stdout", "--no-process-group"]
CMD []

# run this on macos to disable the creation of .DS_Store files on network shares
# defaults write com.apple.desktopservices DSDontWriteNetworkStores true
