#!/bin/bash
mvn install && java -Djava.security.egd=file:/dev/./urandom -jar target/spingboot-producer-1.0.0.jar
