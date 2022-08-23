# Syncthing

After mounting you need to manually add `example.conf` to `/var/syncthing/config/config.xml` inside the container.

# TODO
Auto install instead of moving `example.conf`
It requires to save all the cert files in the config dir to be saved (encrypted) in the git repo\
Otherwise syncthing will generate new UIDs

## inotify limits
You may need to increase `inotify` limit to make Syncthing work.

https://docs.syncthing.net/users/faq.html#inotify-limits

```shell
echo "fs.inotify.max_user_watches=204800" | sudo tee -a /etc/sysctl.conf
echo 204800 | sudo tee /proc/sys/fs/inotify/max_user_watches
```
