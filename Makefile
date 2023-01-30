SECRETSFILE = inject-secrets.sh
SECRETSFILE_ENCRYPTED = $(SECRETSFILE).gpg

# Colors
RESET = \033[0;0m
MAGENTA = \033[1;35m\033[47m
# /Clolors

up: $(SECRETSFILE)
	docker compose up --build -d --remove-orphans

$(SECRETSFILE): $(SECRETSFILE_ENCRYPTED)
	gpg --yes --output $(SECRETSFILE) --decrypt $(SECRETSFILE_ENCRYPTED)
	@echo "$(MAGENTA)Injecting secrets$(RESET)"
	sh $(SECRETSFILE)
	@echo "$(MAGENTA)Secrets injected succesfully$(RESET)"
	@echo ''

inject: $(SECRETSFILE)
	@echo "$(MAGENTA)Injecting secrets$(RESET)"
	sh $(SECRETSFILE)
	@echo "$(MAGENTA)Secrets injected succesfully$(RESET)"
	@echo ''

encrypt:
	gpg --yes --no-symkey-cache --symmetric --output $(SECRETSFILE_ENCRYPTED) $(SECRETSFILE)
	git add $(SECRETSFILE_ENCRYPTED)

stop: down
down:
	docker compose down -t 2

buildone:
	docker compose up -d --no-deps --build $(CONTAINER)

hot-reload-nginx:
	docker exec -it nginx nginx -t
	docker kill -s HUP nginx

# delete everything cached by docker(-compose)
reset:
	docker stop $(docker ps -qa)
	docker rm $(docker ps -qa)
	# docker rmi -f $(docker images -qa)
