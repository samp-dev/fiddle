# PAWN Fiddle
PAWN Fiddle is a playground platform for the PAWN scripting language. Create, execute, fork and share code snippets across the SA-MP community.

## Prerequisites
### Local
- Node.js
- npm
- yarn
- sampctl
- Firejail

### Docker environment
- Docker
- (Docker Compose)

## Installation
### Local
1. Install the dependencies and build the frontend
```bash
cd ui && yarn install && yarn build
```
2. Install the dependencies and transpile the backend
```bash
cd .. && npm i && npm run compile
```
3. Run the application
```bash
npm start
```
### Docker environment
```bash
docker build -t samp-dev/fiddle .
docker run -p 3000:3000 -e APP_ID=pawnlang-fiddle \
-e PORT=3000 \
-e LOG_LEVEL=info \
-e REQUEST_LIMIT=1MB \
-e SESSION_SECRET= \
-e RECAPTCHA_SECRET_KEY= \
-e REACT_APP_RECAPTCHA_KEY= \
samp-dev/fiddle
```
You can find an example using Docker Compose [here](https://github.com/samp-dev/sa-mp.dev-docker).

## Configuration
### Backend
| Environment Variable | Description |
|--|--|
| APP_ID | App name (pawnlang-fiddle) |
| PORT | App port (3000) |
| LOG_LEVEL | [Log levels](https://github.com/trentm/node-bunyan#levels) of the app (info) |
| REQUEST_LIMIT | Body request size limit (1MB) |
| SESSION_SECRET | Secret string to sign cookies () |
| RECAPTCHA_SECRET_KEY | Google reCAPTCHA Invisible secret key () |

### Frontend
| Environment Variable | Description |
|--|--|
| REACT_APP_RECAPTCHA_KEY | Google reCAPTCHA Invisible site key () |

You can also set environment variables in an `.env` file.

Note: If no reCAPTCHA key pair is given, the test key pair will be used, which means all verification requests will pass.

## Use cases
- Library demos
- Snippet hosting

## Coming soon
- REST API to create fiddles programmatically
- More configurations (dependency limit, fiddle size limit, etc.)

## License
This project is licensed under the terms of the MIT license.
