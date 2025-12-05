all:
	pug index.pug
	stylus -p index.styl > index.css
	lsc -cb index.ls

test:
	python -m http.server 8000 >/tmp/quick-timer-test.log 2>&1 & \
	server_pid=$$!; \
	trap "kill $$server_pid" EXIT; \
	sleep 1; \
	curl -f http://localhost:8000/index.html >/dev/null
