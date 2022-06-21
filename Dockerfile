FROM node:14.18.2-alpine AS builder

WORKDIR /svr/app
COPY . .

RUN yarn
ENV NODE_ENV production
RUN yarn build

FROM node:14.18.2-alpine
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk add --no-cache tzdata \
    && cp -r -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

WORKDIR /svr/app
COPY --from=builder /svr/app/dist ./dist
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
COPY ./.npmrc ./.npmrc

ENV HOST=0.0.0.0
ENV PORT=3012

EXPOSE 3012
CMD [ "node", "backend" ]
