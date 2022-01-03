#!/bin/bash

cd $HOME

dirs+=$(cd $HOME && find files/ -maxdepth 1 \
	-not -name 'files' \
	-not -name '.DS_Store' \
	-not -name 'torrents' \
	-not -name 'films' \
	-not -name 'series' \
	-not -name 'dump' \
	-not -name 'other' \
	-exec echo "'{}'" \; \
	| tr '\n' ' ')
dirs+="'server1/runtimeGenerated'"
server="pi@192.168.2.15"
sshcmd="'ssh'"
host="server1"

echo $dirs
sh -c "rsync --archive --no-links --human-readable -P --one-file-system --delete-after --delete-excluded -e $sshcmd $dirs $server:/mnt/files/"
