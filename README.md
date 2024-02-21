# Server1
This repo is running the whole [joppekoers.nl](https://joppekoers.nl) infrastructure\

## Installation

### Prerequisites
- Debian based system
- User `joppe`
- Mount the storage medium on `/home/joppe/files/` automatically with `fstab`
- Copy `syncthing/config.xml` to `./runtimeGenerated/syncthing/config/`

```shell
/bin/sh -c "$(curl -fsSL https://get.docker.com)"
git clone git@github.com:SirMorfield/server1.git
cd server1
make up
```

## Notes
```shell
scp ~/Downloads/CV\ Joppe\ Koers.pdf joppe@80.61.192.39:~/server1/runtimeGenerated/cms/media/CV\ Joppe\ Koers.pdf
```
May take a couple minutes to start the nginx server on first startup since the Diffie-Hellman parameters need to be calculated


Some read only config files are mounted straight into the container
The config files that are written to by the container always contain (hashed) passwords. So we:
- Create a config.example.conf with the redacted secrets
- Decrypt the inject-secrets.sh
- Run the inject-secrets.sh
	- This wil `sed` create all the non-example files with the secrets.\
	  eg: it will take `settings.example.conf` and replace the `INJECT_PASSWORD` with `password` and will write the result to `settings.conf`
