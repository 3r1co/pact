# Pact example project

This project shall demonstrate how to use Consumer-Driven Contracts with [Pacts](http://dius.com.au/2014/05/19/simplifying-micro-service-testing-with-pacts/) in order simplify microservice development.
The idea of the project was taken from this [Node.js Sample App](https://github.com/ccoenraets/directory-react-nodejs) and enriched with a Java Backend, realized with Springboot.

## How to run the application

First start the Pact Broker:
- __docker-compose up pact_broker__
 
Next start the Frontend:
- __docker-compose up consumer__

When the application starts, the Unit Tests will be executed first. Here following steps will be executed:
+ The build process for the node application starts
+ The Pact is defined
+ The mock server is started and populated with the Pact
+ One unit test involving the mock server is executed
+ The Pact is uploaded to the Pact Broker
+ The node application is up and running

Afterwards start the backend service:
- __docker-compose up producer__

When this application starts the following steps will be executed:
+ Pacts for the producing service are retrieved from the pact broker
+ The Pact JVM JUnit Runner generated unit tests for the application
+ These unit tests are executed against the API provided by the application
+ The application is up and running

After all you should be able to target http://hostname:8555 and use the application.

## Remarks

For sure, the way Docker images are built here is not best practice. It is just a simple way to demonstrate how to use Pacts and the Pact Broker.
