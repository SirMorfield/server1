# Nextcloud

## TODO after install
- Set up "External Storage" to a local folder
- Run \
```
docker exec -it -u 1000 server1-nextcloud-app-1 /var/www/html/occ files:scan --path=admin/files/Local
```
(admin being the user name) to scan all the files
- Fix cron
