develop:
	npx webpack serve

install:
	npm ci

build:
	NODE_ENV=production npx webpack

remove-build:
	rm -rf public

test:
	npm test

lint:
	npx eslint .