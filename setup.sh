# After setting up a new machine run these commands

echo Do not run this script directly, run the commands in it manually; exit 1

echo "/dev/disk/by-uuid/13b9900e-3d41-4793-9b41-3f6441dc6b41 /home/joppe/files ext4 rw,relatime 0 0" >> /etc/fstab
# echo "/dev/disk/by-uuid/7c68d501-9f5f-44d8-9f00-11d9a550ab21 /home/joppe/extended ext4 rw,relatime 0 0" >> /etc/fstab
echo "/dev/md0 /home/joppe/files ext4 defaults,nofail,discard 0 0" >> /etc/fstab
# install crontab

sudo echo '0 5 * * * /bin/bash /home/joppe/server1/offsite/offsite.sh >> /home/joppe/offsite.txt' | sudo crontab -
sudo echo '@reboot modprobe nfsd' | sudo crontab -
sudo echo '*/30 * * * * cat /proc/mdstat | grep -q \'\\[UU\\]\' && curl https://hc-ping.com/6d7bd335-37f3-478c-a32e-d3efdbbd8c9c' | sudo crontab -

curl -sL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
