FROM node:22-alpine

WORKDIR /app/mobile


COPY ./mobile/package.json /app/mobile/package.json
RUN npm i

CMD ["npm", "run", "start:docker"]
