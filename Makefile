.PHONY: dev dev-build dev-down test test-unit test-integration test-e2e test-coverage \
        lint lint-fix typecheck format \
        db-migrate db-reset db-seed db-studio \
        build-prod prod-up prod-down prod-logs prod-migrate \
        clean help

# ===========================================
# Development
# ===========================================

dev: ## Start development environment (app + postgres)
	docker-compose up

dev-build: ## Rebuild containers and start development
	docker-compose up --build

dev-down: ## Stop and remove development containers
	docker-compose down

dev-shell: ## Open shell in running app container
	docker-compose exec app sh

# ===========================================
# Testing
# ===========================================

test: ## Run all tests (unit + integration)
	npm run test

test-unit: ## Run unit tests only
	npm run test:unit

test-integration: ## Run integration tests only
	npm run test:integration

test-e2e: ## Run end-to-end tests with Playwright
	npm run test:e2e

test-coverage: ## Run tests with coverage report
	npm run test:coverage

# ===========================================
# Code Quality
# ===========================================

lint: ## Run ESLint
	npm run lint

lint-fix: ## Fix auto-fixable lint issues
	npm run lint:fix

typecheck: ## Run TypeScript type check
	npx tsc --noEmit

format: ## Format code with Prettier
	npm run format

format-check: ## Check formatting without writing files
	npm run format:check

# ===========================================
# Database
# ===========================================

db-migrate: ## Apply pending migrations
	npx prisma migrate deploy

db-migrate-dev: ## Create and apply a new migration (dev only)
	npx prisma migrate dev

db-reset: ## Reset database (drops all data)
	npx prisma migrate reset

db-seed: ## Seed database with initial data
	npx prisma db seed

db-studio: ## Open Prisma Studio (database GUI) at localhost:5555
	npx prisma studio

# ===========================================
# Production
# ===========================================

build-prod: ## Build production Docker image
	docker build -t minitask:latest .

prod-up: ## Start production environment
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Stop production environment
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## Tail production logs
	docker-compose -f docker-compose.prod.yml logs -f

prod-migrate: ## Run database migrations in production
	docker-compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# ===========================================
# Cleanup
# ===========================================

clean: ## Remove containers, volumes, and build artifacts
	docker-compose down -v
	rm -rf .next node_modules coverage dist build

# ===========================================
# Help
# ===========================================

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-22s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
