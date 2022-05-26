SECRETSFILE = inject-secrets.sh
SECRETSFILE_ENCRYPTED = $(SECRETSFILE).gpg

$(SECRETSFILE): $(SECRETSFILE_ENCRYPTED)
	gpg --output $(SECRETSFILE) -decrypt $(SECRETSFILE_ENCRYPTED)

decrypt: $(SECRETSFILE)
	sh $(SECRETSFILE)

encrypt:
	gpg --no-symkey-cache --symmetric --output $(SECRETSFILE_ENCRYPTED) $(SECRETSFILE)


preinstall:
	sh ./srcs/preinstall.sh

# Build and start all containers in docker-compose file
up:
	docker-compose up --build -d --remove-orphans

# Stop all containers in docker-compose file
down:
	docker-compose down -t 2

# Build single container in docker-compose file
buildone:
	docker-compose up -d --no-deps --build $(CONTAINER)

# Stop all running containers
stopall:
	docker kill $(shell docker ps -q)
	reinstall:

# delete everything cached by docker(-compose)
reset:
	docker stop $(docker ps -qa)
	docker rm $(docker ps -qa)
	# docker rmi -f $(docker images -qa)
