FROM node:16-alpine

WORKDIR /app/client

COPY ./client/.npmrc /app/client/.npmrc
COPY ./client/package.json /app/client/package.json
RUN npm i

{% if cookiecutter.client_app == 'React' %}
CMD ["npm", "run", "start"]
{% elif cookiecutter.client_app == 'Vue' %}
CMD ["npm", "run", "serve"]
{% endif %}

