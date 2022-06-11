#!/bin/bash

set -e # quit on error
set -x # print exectued commands

BACKUP_DIRS+="$HOME/files "
BACKUP_DIRS+="$HOME/server1/runtimeGenerated "
echo $BACKUP_DIRS

SERVER="root@server"
SSHCMD="ssh"

REMOTE_MOUNT_PATH="/root/files"
REMOTE_DRIVE_UUID="5b328bfd-528f-4e46-9974-5f86ca196011" # Use blkid to find this
REMOTE_LUKS_NAME="volume1"

# TODO: shutdown and remote wake on lan

$SSHCMD $SERVER mkdir -p $REMOTE_MOUNT_PATH
$SSHCMD $SERVER echo 'INJECT_DISK_PASSWORD' '|' cryptsetup luksOpen /dev/disk/by-uuid/$REMOTE_DRIVE_UUID volume1 -d=- || true
$SSHCMD $SERVER mount /dev/mapper/$REMOTE_LUKS_NAME $REMOTE_MOUNT_PATH || true

# TODO: enable compression?, verify disk is mounted
sh -c "rsync --archive --no-links --human-readable -P --one-file-system --delete-after --delete-excluded -e '$SSHCMD' $BACKUP_DIRS $SERVER:$REMOTE_MOUNT_PATH" || true

$SSHCMD $SERVER umount $REMOTE_MOUNT_PATH
$SSHCMD $SERVER cryptsetup luksClose /dev/mapper/$REMOTE_LUKS_NAME
