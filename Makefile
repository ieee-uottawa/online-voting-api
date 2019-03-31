build: 
	docker build -t ieeeuottawa/online-voting .
start: 
	make start-quick
	docker-compose run online-voting npm run migrate
	docker-compose run online-voting npm run setup
start-quick:
	docker-compose up -d online-voting
stop:
	docker-compose down
restart:
	make stop
	make start-quick
update:
	git pull
	make build
	make restart
