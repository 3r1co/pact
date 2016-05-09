var assert = require('chai').assert;
var expect = require('chai').expect;
var child_process = require('child_process');
var superagent = require('superagent');
var status = require('http-status');
var Q = require('q');

var Pact = require('pact-consumer-js-dsl');
var PactPublisher = require('node-pact-publisher');
var pactDir =  __dirname + "/pacts";
var pactLogFile = __dirname + "/pacts/pacts.log";
var pactBrokerUrl = process.env.PACT_BROKER_URL;
var pactMockPort = 1234;
var pactMockServiceProcess;
var term = Pact.Match.term;

var eachLike = Pact.Match.eachLike;

var employeeProvider;

var frontEndServiceName = 'EmployeeFrontEndService';
var backEndServiceName = 'EmployeeBackEndService';

process.env.EMPLOYEE_SERVICE = "http://localhost:" + pactMockPort;
var server = require('../server');
var port = 3000;

var myPublisher = new PactPublisher({
  appVersion: require(__dirname + '/../package.json').version,
  brokerBaseUrl: pactBrokerUrl,
  pacts: pactDir
});

var successful = true;

var errorHandler = function (err) {  console.log('Error occured: ' + err); };

var initProvider = function(done) {
  employeeProvider = Pact.mockService({
    consumer: frontEndServiceName,
    provider: backEndServiceName,
    port: pactMockPort,
    done: (error) => { expect(error).to.be.null; }
  });
  done();
}

var configureProviderForAllEmployees = function() {
  employeeProvider
    .uponReceiving("a request for an all employees")
    .withRequest("GET", "/getAllEmployees", { "Accept": "*/*" })
    .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
            "employees" : eachLike({
                id: term({matcher: "\\d+", generate: "10"}),
                firstName: term({matcher: ".*", generate: "James"}),
                lastName: term({matcher: ".*", generate: "King"}),
                managerId: term({matcher: "\\d+", generate: '0'}),
                managerName: term({matcher: ".*", generate: 'CEO'}),
                reports: term({matcher: "\\d+", generate: '0'}),
                title: term({matcher: ".*", generate: 'Master of Destruction'}),
                department: term({matcher: ".*", generate: 'RnD'}),
                mobilePhone: term({matcher: ".*", generate: '000-000-000'}),
                officePhone: term({matcher: ".*", generate: '999-999-999'}),
                email: term({matcher: ".*", generate: 'e@mail.com'}),
                city: term({matcher: ".*", generate: 'La Ciotat'}),
                pic: term({matcher: ".*", generate: 'pizza'}),
                twitterId: term({matcher: ".*", generate: 'pizza'}),
                blog: term({matcher: ".*", generate: 'pizza'})
            })
        }
      });
}


describe('Employee Test Suite', function() {
  //Set high timeout to make sure the pact broker is ready
  this.timeout(60000);
  before(function (done) {
    console.log("\n\t\tPact Mock Server at http://localhost:" + pactMockPort);
    console.log("\t\tPact Broker at: " + pactBrokerUrl);
    pactMockServiceProcess = child_process.exec('pact-mock-service --port '+ pactMockPort + ' --pact-dir ' + pactDir + ' -l ' + pactLogFile + ' --pact-specification-version 2.0.0');
    //The Mock Service needs to start before we can setup the Provider, so let's use a timeout
    setTimeout(function() {initProvider(done);}, 3000);
    server.listen(port, function () {
        console.log('\t\tUnit Test Express server listening on port ' + port);
    });
  });

  it('returns all employees', function(done) {
    configureProviderForAllEmployees();
    employeeProvider.run(done, (runComplete) => {
      superagent.get('http://localhost:' + port + '/employees').end(function(err, res) {
        assert.ifError(err);
        assert.equal(res.status, status.OK);
        expect(res.body).to.be.a('array');
        runComplete();
      });
    });
  });

  afterEach(function () { if (this.currentTest.state == 'failed') { successful = false; };}); //If one test is failed, set the global successful variable to false;

  after(function (done) {
    //Stop the Mock Service, otherwise it will keep running
    pactMockServiceProcess.kill();
    if (!successful) { done(new Error('Tests are failing, dont push the pact')); return; }
    //For now, we have one Consumer and one Provider
    var PACTICIPANTS = [ frontEndServiceName, backEndServiceName ];
    var isRegisteredPromises = PACTICIPANTS.map(function (pacticipant) { return myPublisher.isPacticipantRegistered(pacticipant);  });
    Q.all(isRegisteredPromises)
      .then(function (isRegisteredResponses) {
        var registerPromises = [];
        // For all register responses
        isRegisteredResponses.forEach(function (isRegistered, i) {
          // If one of them wasn't registered push a register promise to register the i'th pacticipant that wasn't yet registered. This is because the broker will reject us publishing a pact if a pacticipant is not yet registered with it.
          if (!isRegistered) {
            var pacticipantName = PACTICIPANTS[i];
            console.info(pacticipantName, "isn't registered yet. Registering...");
            registerPromises.push(myPublisher.registerPacticipant(pacticipantName));
          }
        });
        return Q.all(registerPromises); }) // Return a promise to register all pacticipants, or an empty array of promises to move onto the publishing promise
      .then(function (registerInfo) { return myPublisher.publish(); }) // Publish all the pacts when we're done with registering (if need be)
      .then(function (pactsPublished) { console.info('Finished!');}) // And we're done!
      .catch(errorHandler)
      .done(function() { done(); });
  });
});
