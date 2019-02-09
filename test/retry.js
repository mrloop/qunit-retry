const retry = require('../index.js');

retry('test default retry twice', function(assert, currentRun) {
  assert.expect(1);
  assert.equal(currentRun, 2);
});

retry('test retry five times', function(assert, currentRun) {
  assert.expect(1);
  assert.equal(currentRun, 5);
}, 5);

retry('test retry async', async function(assert, currentRun) {
  assert.expect(1);
  assert.equal(currentRun, 4);
}, 4);


QUnit.module('currentRun count', function() {
  // tests are order dependent
  // count retries in retryTest
  // assert correct count in another test
  let execCount = 0;

  retry('count retries', function(assert, currentRun) {
    execCount = execCount + 1;
    assert.equal(currentRun, 5);
  }, 5);

  QUnit.test('execCount for retryTest', function(assert) {
    assert.equal(execCount, 5);
  });
});
