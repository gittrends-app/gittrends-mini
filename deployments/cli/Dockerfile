FROM node:18-alpine AS build

RUN apk add g++ make py3-pip

WORKDIR /gittrends-app

COPY .husky .husky
COPY package.json package.json
RUN yarn install

COPY . .

RUN rm -rf ./app/web
RUN yarn install
RUN yarn build-shared
RUN yarn build-cache
RUN yarn build-cli


FROM node:18-alpine AS production

RUN apk add git

COPY --from=build /gittrends-app /gittrends-app

WORKDIR /gittrends-app

RUN rm -rf node_modules
RUN yarn install --production && yarn autoclean --force

ENV PORT=80
EXPOSE 80

WORKDIR /gittrends-app/app/cli

CMD yarn cli-runtime bull-board

