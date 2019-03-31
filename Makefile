build: 
	docker build -t ieeeuottawa/online-voting .
start: 
	docker-compose up -d online-voting
	docker-compose run online-voting npm run migrate
stop:
	docker-compose down
restart:
	make stop
	make start
update:
	git pull
	make build
	make restart
