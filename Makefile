include .env
export $(shell sed 's/=.*//' .env)

up: preinstall
	docker-compose up --build -d --remove-orphans

down:
	docker-compose down -t 2

preinstall:
	sh ./srcs/preinstall.sh
	touch preinstall

# delete everything cached by docker(-compose)
reset:
	docker stop $(docker ps -qa)
	docker rm $(docker ps -qa)
	# docker rmi -f $(docker images -qa)
