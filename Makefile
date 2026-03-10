.PHONY: dev build start prod

# Dev server com hot reload (compila on-demand)
dev:
	npm run dev

# Compila tudo de uma vez
build:
	npm run build

# Roda a build já compilada (precisa rodar build antes)
start:
	npm run start

# Compila e roda — sem delay de compilação
prod:
	npm run build && npm run start
