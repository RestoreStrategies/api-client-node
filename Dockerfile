FROM node:4

MAINTAINER Joseph Simmons 'joseph@austinstone.org'
ENV REFRESHED 2015-12-03
ENV NODE_PATH /usr/local/lib/node_modules/forthecity-client/node_modules/
ENV NODE_ENV development
VOLUME ["/opt/app"]
WORKDIR "/opt/app"
ADD package.json /opt/app/package.json
RUN npm install --global
RUN npm install --global lab@"^7.3.0" code@"^2.0.1"
