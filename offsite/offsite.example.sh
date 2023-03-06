#!/bin/bash

set -e # quit on error
set -x # print exectued commands

HOME="/home/joppe"
BACKUP_DIR="$HOME/files"
SERVER="root@87.214.63.99"
SSHCMD="ssh -p 10001"
REMOTE_MOUNT_PASSWORD="password"
REMOTE_MOUNT_PATH="/root/files"
REMOTE_DRIVE_UUID="5b328bfd-528f-4e46-9974-5f86ca196011" # Use blkid to find this
REMOTE_LUKS_NAME="volume1"
EXCLUDE="--exclude={'**/node_modules','**/.DS_Store'}"

RSYNC="rsync --archive --no-links --human-readable --partial --progress --one-file-system --delete-excluded $EXCLUDE"

$SSHCMD $SERVER mkdir -p $REMOTE_MOUNT_PATH
$SSHCMD $SERVER echo "$REMOTE_MOUNT_PASSWORD" '|' cryptsetup luksOpen /dev/disk/by-uuid/$REMOTE_DRIVE_UUID volume1 -d=- || true
$SSHCMD $SERVER mount /dev/mapper/$REMOTE_LUKS_NAME $REMOTE_MOUNT_PATH || true

# Copy ssd folders to big hdd
$RSYNC "$HOME/server1/runtimeGenerated" "$BACKUP_DIR/sync/server1"
$RSYNC "$HOME/git" "$BACKUP_DIR/sync"

# TODO: verify disk is mounted
$RSYNC -e "$SSHCMD" "$BACKUP_DIR" "$SERVER:$REMOTE_MOUNT_PATH" || true

$SSHCMD $SERVER umount $REMOTE_MOUNT_PATH
$SSHCMD $SERVER cryptsetup luksClose /dev/mapper/$REMOTE_LUKS_NAME
