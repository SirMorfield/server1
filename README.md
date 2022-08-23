# Server1
This repo is running the whole [joppekoers.nl](https://joppekoers.nl) infrastructure\
With a bit of luck the whole thing should not take more than 5 commands.

```shell
/bin/sh -c "$(curl -fsSL https://get.docker.com)"
git clone git@github.com:SirMorfield/server1.git
cd server1
make decrypt # inject secrets into example files
make up
```

## Notes
May take a couple minutes to start the nginx server on first startup since the Diffie-Hellman parameters need to be calculated


Some read only config files are mounted straight into the container
The config files that are written to by the container always contain (hashed) passwords. So we:
- Create a config.example.conf with the redacted secrets
- Decrypt the inject-secrets.sh
- Run the inject-secrets.sh
	- This wil `sed` create all the non-example files with the secrets.\
	  eg: it will take `settings.example.conf` and replace the `INJECT_PASSWORD` with `password` and will write the result to `settings.conf`
