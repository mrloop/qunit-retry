/**
 * Add a test to run and retry
 *
 * Add a test to run using qunit-retry and `QUnit.test()`.
 *
 * The `assert` argument to the callback contains all of QUnit's assertion
 * methods. Use this argument to call your test assertions.
 *
 * maxRuns is the number of times to retry a failing callback function before the test is considered failed. It defaults to 2.
 *
 * `QUnit.test()` can automatically handle the asynchronous resolution of a
 * Promise on your behalf if you return a thenable Promise as the result of
 * your callback function.
 *
 * @param {string} Title of unit being tested
 * @param callback Function to close over assertions
 * @param {number} maxRuns
 *
 * @example
 * retry("a test relying on 3rd party service that occassionaly fails", async function(assert) {
 *   var result = await occasionallyFailingServiceTestResult();
 *   assert.equal(result, 42);
 * });

 */
declare function retry(
  name: string,
  callback: (assert: Object) => void | Promise<void>,
  maxRuns?: number,
): void;
