#!/bin/bash

set -e # quit on error
set -x # print exectued commands

HOME="/home/joppe"
BACKUP_DIR="$HOME/files"
SERVER="root@87.214.63.99"
SSHCMD="ssh -p 10001"
REMOTE_MOUNT_PASSWORD="password"
REMOTE_MOUNT_PATH="/root/files"
REMOTE_TRASH_DIR="$REMOTE_MOUNT_PATH/deleted"
REMOTE_DRIVE_UUID="5b328bfd-528f-4e46-9974-5f86ca196011" # Use blkid to find this
REMOTE_LUKS_NAME="volume1"
EXCLUDE="--exclude={'**/node_modules','**/.DS_Store'}"

RSYNC_LOCAL="rsync --archive --no-links --human-readable --partial --progress --one-file-system --delete-excluded $EXCLUDE"
RSYNC_REMOTE="$RSYNC_LOCAL --backup-dir $REMOTE_TRASH_DIR"

# Copy ssd folders to big hdd
$RSYNC_LOCAL "$HOME/server1/runtimeGenerated" "$BACKUP_DIR/sync/server1"
$RSYNC_LOCAL "$HOME/git" "$BACKUP_DIR/sync"

$SSHCMD $SERVER mkdir -p $REMOTE_MOUNT_PATH
$SSHCMD $SERVER mkdir -p $REMOTE_TRASH_DIR

$SSHCMD $SERVER echo "$REMOTE_MOUNT_PASSWORD" '|' cryptsetup luksOpen /dev/disk/by-uuid/$REMOTE_DRIVE_UUID volume1 -d=- || true
$SSHCMD $SERVER mount /dev/mapper/$REMOTE_LUKS_NAME $REMOTE_MOUNT_PATH || true

# Assert that the remote drive is mounted
fs_size_gb=$($SSHCMD $SERVER "df -BG $REMOTE_MOUNT_PATH" | awk 'NR==2{ print $2 }' | tr -d 'G')
(( $fs_size_gb > 100 ))

# delete oldest files in trash until there is more than 300GB free space
while true; do
	gb_free=$($SSHCMD $SERVER "df -BG $REMOTE_MOUNT_PATH" | awk 'NR==2{ print $4 }' | tr -d 'G')
	(( $gb_free > 300 )) && break

	oldest_files=$($SSHCMD $SERVER "ls -t $REMOTE_TRASH_DIR | tail -n -5")
	[ ! -n "$oldest_files" ] && break

	$SSHCMD $SERVER "echo \"$oldest_files\" | xargs -I {} rm -rf $REMOTE_TRASH_DIR/{}"
done

$RSYNC_REMOTE -e "$SSHCMD" "$BACKUP_DIR" "$SERVER:$REMOTE_MOUNT_PATH" || true

$SSHCMD $SERVER umount $REMOTE_MOUNT_PATH
$SSHCMD $SERVER cryptsetup luksClose /dev/mapper/$REMOTE_LUKS_NAME
