while [ true ]; do
	# rclone copy dropbox: /dropbox/
	rclone --no-check-certificate copy googleDrive: /googleDrive/ &>> /var/log/rclone.log

	sleep 2880
done
