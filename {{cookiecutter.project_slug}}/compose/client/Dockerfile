FROM node:16-alpine

COPY ./client/.npmrc /app/client/.npmrc
COPY ./client/package.json /app/client/package.json
RUN npm install @vue/cli@3.7.0 -g

WORKDIR /app/client
RUN npm i

CMD ["npm", "run", "serve"]
