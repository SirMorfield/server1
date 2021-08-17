while [ true ]; do
	rclone copy dropbox: /dropbox/
	rclone copy googleDrive: /googleDrive/
	sleep 1800
done
