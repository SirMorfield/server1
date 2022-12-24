# Nginx

See `../Makefile`\
Before restarting Nginx after making changes to the configuration, run
```shell
docker exec -it nginx nginx -t
```
to check the configuration files.