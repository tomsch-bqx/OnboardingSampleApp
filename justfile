# OnboardingSampleApp
#
# Common commands:
#   just install  - Install root, server, and client dependencies
#   just start    - Run full app (server + client)
#   just test     - Run unit tests + Playwright e2e tests
#   just lint     - Lint client/ and server/
#   just format   - Format the repo with Prettier
#
# See 'just --list' for all available commands

# Show available commands
default:
    @just --list

# Install root, server, and client dependencies
install:
    npm run install:all

# Run full app (server + client)
start:
    npm start

# Run unit tests (server) + Playwright e2e tests
test PATH="":
    npm run test:unit
    npx playwright test {{PATH}}

# Lint client/ and server/
lint:
    npx eslint client/src server/src

# Format the repo with Prettier
format:
    npx prettier --write .

# Install git hooks (husky + lint-staged)
pre-commit-install:
    npx husky init

# Run lint-staged against currently staged files
pre-commit-run:
    npx lint-staged
