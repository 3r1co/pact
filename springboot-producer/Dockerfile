FROM maven:3-jdk-8

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

#ENV PACT_BROKER_URL pact_broker

ADD . /usr/src/app
ENTRYPOINT [ "sh", "/usr/src/app/startContainer.sh" ]
