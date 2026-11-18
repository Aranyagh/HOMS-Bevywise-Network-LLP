FROM node:20.10-alpine

RUN yarn global add ts-node nodemon pm2

WORKDIR /app