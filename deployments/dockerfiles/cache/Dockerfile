FROM node:alpine

WORKDIR /gittrends-app

COPY .husky .husky
COPY package.json package.json
RUN yarn install

COPY [^app]* .

COPY ./app/cache ./app/cache

WORKDIR /gittrends-app/app/cache
RUN yarn install
RUN yarn build

ENV PORT=80
EXPOSE 80

CMD yarn start

