#!/bin/bash

set -e # quit on error
set -x # print exectued commands

cd $HOME

BACKUP_DIRS+=$(cd $HOME && find files/ -maxdepth 1 \
	-not -name 'files' \
	-not -name '.DS_Store' \
	-not -name 'torrents' \
	-exec echo "'{}'" \; \
	| tr '\n' ' ')
echo $BACKUP_DIRS

BACKUP_DIRS+="'server1/runtimeGenerated'"
SERVER="root@192.168.2.21"
SSHCMD="ssh"

REMOTE_MOUNT_PATH="/root/files"
REMOTE_DRIVE_UUID="5b328bfd-528f-4e46-9974-5f86ca196011" # Use blkid to find this
REMOTE_LUKS_NAME="volume1"

$SSHCMD $SERVER mkdir -p $REMOTE_MOUNT_PATH
# TODO: ony run if not mounted
$SSHCMD $SERVER echo '' '|' cryptsetup luksOpen /dev/disk/by-uuid/5b328bfd-528f-4e46-9974-5f86ca196011 volume1 -d=-
$SSHCMD $SERVER mount /dev/mapper/$REMOTE_LUKS_NAME $REMOTE_MOUNT_PATH

# TODO: enable compression?
sh -c "rsync --archive --no-links --human-readable -P --one-file-system --delete-after --delete-excluded -e \'$SSHCMD\' $BACKUP_DIRS $SERVER:$REMOTE_MOUNT_PATH"

$SSHCMD $SERVER umount $REMOTE_MOUNT_PATH
$SSHCMD $SERVER cryptsetup luksClose /dev/mapper/$REMOTE_LUKS_NAME

cd -
