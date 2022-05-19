SECRETSFILE = inject-secrets.sh
SECRETSFILE_ENCRYPTED = $(SECRETSFILE).gpg

$(SECRETSFILE): $(SECRETSFILE_ENCRYPTED)
	gpg --output $(SECRETSFILE) --decrypt $(SECRETSFILE_ENCRYPTED)

decrypt: $(SECRETSFILE)
	sh $(SECRETSFILE)

encrypt:
	gpg --no-symkey-cache --symmetric --output $(SECRETSFILE_ENCRYPTED) $(SECRETSFILE)

up:
	docker-compose up --build -d --remove-orphans

down:
	docker-compose down -t 2

buildone:
	docker-compose up -d --no-deps --build $(CONTAINER)

preinstall:
	sh ./srcs/preinstall.sh

# delete everything cached by docker(-compose)
reset:
	docker stop $(docker ps -qa)
	docker rm $(docker ps -qa)
	# docker rmi -f $(docker images -qa)
