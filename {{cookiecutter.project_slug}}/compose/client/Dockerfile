FROM node:16-alpine

# NPM RC IS USED AT IMAGE BUILD AND CANNOT BE PASSED AS AN ENV VARIABLE
# THE VALUE WILL BE VISIBLE IN COMMIT HISTORY https://docs.npmjs.com/docker-and-private-modules
ARG NPM_READ_ONLY_TOKEN

COPY ./client/.npmrc /app/client/.npmrc
COPY ./client/package.json /app/client/package.json
RUN npm install @vue/cli@3.7.0 -g

WORKDIR /app/client
RUN npm i

CMD ["npm", "run", "serve"]
