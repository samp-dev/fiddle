FROM node

# SAMPCTL
COPY sampctl-install-deb-sudo.sh /
RUN dpkg --add-architecture i386 && \
    apt update && \
    apt install -y g++-multilib git ca-certificates && \
    sh /sampctl-install-deb-sudo.sh

# FIREJAIL
RUN DEBIAN_FRONTEND=noninteractive apt install -y firejail

# SA-MP PAWN FIDDLE
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm install

WORKDIR /usr/src/app/ui
COPY ./ui/package.json /usr/src/app/ui/
RUN yarn install

WORKDIR /usr/src/app
COPY . .
RUN npm run compile

#WORKDIR /usr/src/app/ui
#RUN yarn build

WORKDIR /usr/src/app
ENTRYPOINT [ "npm", "start" ]
