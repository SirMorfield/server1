# Nginx

Before restarting Nginx after making changes to the configuration, run
```shell
docker exec -it server1-nginx-1 nginx -t
```
to check the configuration files.


## Adding a subdomain
Make sure that you configure the subodmain on your domain name provider

After adding run: to automatically regenerate all the ssl certificates
```shell
sudo rm -rf runtimeGenerated/nginx
```

## Full process
```shell
docker compose stop nginx
# make changes to the configuration file(s)
docker-compose up -d nginx
docker compose logs --tail 1000 -f nginx
```
