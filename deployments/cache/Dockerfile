FROM node:16-alpine AS build

WORKDIR /gittrends-app

COPY package.json package.json
RUN yarn install

COPY . .

RUN rm -rf shared && cd app && (ls | grep -xv "cache" | xargs rm -rf)
RUN yarn install && yarn build-cache

FROM node:16-alpine AS production

WORKDIR /gittrends-app
COPY --from=build /gittrends-app/app/cache .
RUN yarn install --production

ENV PORT=80
EXPOSE 80

CMD yarn start

