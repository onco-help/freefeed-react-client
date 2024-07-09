FROM node:20 as builder

RUN apt-get update && \
    apt-get install -y \
    g++ \
    git \
    make

WORKDIR /client
ADD . /client 

RUN rm -rf node_modules && \
    rm -f log/*.log && \
    yarn install && \
    yarn build-prod

FROM nginx:1.27

COPY --from=builder /client/_dist /usr/share/nginx/html
COPY config.json /usr/share/nginx/html/config.json
VOLUME /usr/share/nginx/html
