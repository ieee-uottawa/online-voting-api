build: 
	docker build -t ieeeuottawa/online-voting .
start: 
	docker-compose up -d online-voting
restart: 
	git pull
	make build
	docker-compose down
	make start
