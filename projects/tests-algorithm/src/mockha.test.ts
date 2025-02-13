import { expect } from "chai";
import mock from "mock-require";
import * as sinon from "sinon";

import { RuleEngine } from "@extension/algorithm/rules";

// Geddit, MOCK-ha?
// No, just me? ok :(
describe("Mockha testing", () => {
  // const folderPath = "C:/UNI/FYP/nestjs-realworld-example-app";

  it("verifying simple addition", () => {
    const result = 1+1;
    expect(result).to.equal(2);
  });
});

describe("Mocked module testing", () => {
  let ruleset: any;
  let rulesetStub: sinon.SinonStub;

  beforeEach(() => {
    mock('vscode', {});
    ruleset = require("@extension/helpers/ruleset");

    rulesetStub = sinon.stub(ruleset, 'retrieveRuleset')
    rulesetStub.returns(RuleEngine.loadRules('./config/default-rules.json'));
  });

  afterEach(() => {
    sinon.restore();
  });

  it('mocks ruleset retrieval', () => {
    console.log(ruleset.retrieveRuleset());
  })
})
