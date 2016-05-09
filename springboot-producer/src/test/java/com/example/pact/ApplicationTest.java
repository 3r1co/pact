package com.example.pact;

import au.com.dius.pact.provider.junit.PactRunner;
import au.com.dius.pact.provider.junit.Provider;
import au.com.dius.pact.provider.junit.loader.PactBroker;
import au.com.dius.pact.provider.junit.target.HttpTarget;
import au.com.dius.pact.provider.junit.target.Target;
import au.com.dius.pact.provider.junit.target.TestTarget;
import org.junit.Before;
import org.junit.runner.RunWith;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.boot.test.WebIntegrationTest;
import org.springframework.test.context.TestContextManager;

@RunWith(PactRunner.class)
@Provider("EmployeeBackEndService")
@PactBroker(host="${PACT_BROKER_URL}", port = "80")
@SpringApplicationConfiguration(Application.class)
@WebIntegrationTest("server.port=8888")
public class ApplicationTest {

    @TestTarget
    public Target target = new HttpTarget(8888);

    private TestContextManager testContextManager;

    @Before
    public void setUp() throws Exception {
        this.testContextManager = new TestContextManager(getClass());
        this.testContextManager.prepareTestInstance(this);
    }

}