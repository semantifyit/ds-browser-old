FROM node:10-alpine

COPY ./package*.json /var/src/
WORKDIR /var/src

# install node dependencies
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install

COPY . /var/src

# Expose website on port
EXPOSE 8080

ENV NODE_ENV development

CMD npm start