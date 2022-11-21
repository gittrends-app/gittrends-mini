FROM node:16-alpine AS build

WORKDIR /gittrends-app

COPY .husky .husky
COPY package.json package.json
RUN yarn install

COPY [^app]* .

COPY ./app/cache ./app/cache

WORKDIR /gittrends-app/app/cache
RUN yarn install
RUN yarn build

FROM node:16-alpine AS production

WORKDIR /gittrends-app
COPY --from=build /gittrends-app/app/cache .
RUN yarn install --production

ENV PORT=80
EXPOSE 80

CMD yarn start

