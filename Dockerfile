FROM node:18-slim

ENV NODE_ENV=production

WORKDIR /app

COPY "./" "./"

RUN yarn install

CMD [ "yarn", "start" ]