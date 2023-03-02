FROM node:alpine

RUN apk add --update git

WORKDIR /proxy-server

RUN yarn init -y
RUN yarn add gittrends-app/github-proxy-server

ENTRYPOINT [ "yarn", "github-proxy-server" ]

CMD [ "--help" ]