FROM node:10

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm install express express-openid-connect --save
RUN npm install mysql
RUN npm install js-md5

COPY . .

EXPOSE 8080

CMD [ "node", "server.js" ]


