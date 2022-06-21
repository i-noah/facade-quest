FROM node:12.18.3-alpine AS builder

WORKDIR /svr/app
COPY . .

RUN yarn
ENV NODE_ENV production
RUN yarn build

FROM node:12.18.3-alpine
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk add --no-cache tzdata \
    && cp -r -f /usr/share/zoneinfo/Asia/Shanghai /etc/localtime

WORKDIR /svr/app
COPY --from=builder /svr/app/dist .

ENV HOST=0.0.0.0
ENV PORT=3012

EXPOSE 3012
CMD [ "node", "backend" ]
