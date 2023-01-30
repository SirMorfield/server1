# After setting up a new machine run these commands

echo Do not run this script directly, run the commands in it manually; exit 1

echo "/dev/disk/by-uuid/13b9900e-3d41-4793-9b41-3f6441dc6b41 /home/joppe/files ext4 rw,relatime 0 0" >> /etc/fstab

# install crontab

echo "0 3 */2 * * /bin/bash /home/joppe/server1/offsite/offsite.sh | grep -v 'skipping non-regular file' &>> /home/joppe/offsite.txt ; echo $(date) >> /home/joppe/offsite.txt" | crontab -

curl -sL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt-get install -y nodejs
