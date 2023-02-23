FROM node:alpine

RUN apk add --update git

WORKDIR /proxy-server

RUN yarn init -y
RUN yarn add gittrends-app/github-proxy-server

CMD yarn github-proxy-server