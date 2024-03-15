// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: TestSequencer } = require('@jest/test-sequencer');

class JestSequencer extends TestSequencer {
  sort(tests) {
    const appSpecTests = [];
    const appE2ETests = [];
    const registerTests = [];
    const usersTests = [];
    const otherTests = [];

    tests.forEach((test) => {
      if (test.path.includes('\\app.spec.ts')) {
        appSpecTests.push(test);
      } else if (test.path.includes('\\app.e2e.spec.ts')) {
        appE2ETests.push(test);
      } else if (test.path.includes('\\register.')) {
        registerTests.push(test);
      } else if (test.path.includes('\\users.')) {
        usersTests.push(test);
      } else {
        otherTests.push(test);
      }
    });

    return [
      ...appSpecTests,
      ...appE2ETests,
      ...otherTests,
      ...registerTests,
      ...usersTests,
    ];
  }
}

module.exports = JestSequencer;
