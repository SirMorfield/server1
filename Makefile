include .env
export $(shell sed 's/=.*//' .env)

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
