FROM node:4.4.3

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

RUN npm install --unsafe-perm pact-mock-service
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

#ENV PACT_BROKER_URL http://pact_broker/
#ENV EMPLOYEE_SERVICE http://employee_service/

ENTRYPOINT [ "sh", "/usr/src/app/startContainer.sh" ]
