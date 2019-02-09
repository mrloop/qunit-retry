// https://github.com/umdjs/umd/ - returnExports
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    if (QUnit) { // if QUnit already globally defined
      // https://github.com/karma-runner/karma-qunit/issues/57
      define('qunit', [], function() {
        return QUnit;
      });
    };
    // AMD. Register as an anonymous module, that depends on qunit
    define(['qunit'], factory);
  } else if (typeof module === 'object' && module.exports) {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory(require('qunit'));
  } else {
    // Browser globals (root is window)
    root.returnExports = factory(root.qunit);
  }
}(typeof self !== 'undefined' ? self : this, function (qunit) {
  // Use qunit in some fashion.

  // Just return a value to define the module export.
  // This example returns an object, but the module
  // can return a function as the exported value.

  const shouldRetry = function(currentRun, maxRuns, result = { result: false }) {
    return currentRun < maxRuns && !result.result
  }

  const hooksFor = function(module, handler) {
    let hooks = [];
    if ( module.parentModule ) {
      hooks = hooks.concat(hooksFor(module.parentModule, handler));
    }
    return hooks.concat(module.hooks[ handler ]);
  }

  const runHooks = async function(assert, handler) {
    for(const hook of hooksFor(assert.test.module, handler)) {
      await hook.call(assert.test.testEnvironment, assert);
    }
  }

  const runTest = async function(assert, callback, maxRuns, currentRun) {
    if (currentRun > 1) {
      // first run is 1, and qunit has already triggered beforeEach
      await runHooks(assert, "beforeEach");
    }
    const result = await bufferResult(assert, callback, maxRuns, currentRun);
    if (shouldRetry(currentRun, maxRuns, result)) {
      // only run afterEach hooks if going to retry test
      await runHooks(assert, "afterEach");
    }
    return result;
  }

  const bufferResult = async function(assert, callback, maxRuns, currentRun) {
    const original = assert.pushResult;
    let resultBuffer;
    assert.pushResult = function(result) {
      resultBuffer = result;
    }
    try {
      await callback.call(assert.test.testEnvironment, assert, currentRun);
    } catch (err) {
      if(!shouldRetry(currentRun, maxRuns)) {
        throw err;
      }
    }
    assert.pushResult = original;
    return resultBuffer;
  };

  const retry = async function(assert, callback, maxRuns, currentRun) {
    const result = await runTest(assert, callback, maxRuns, currentRun);
    if (shouldRetry(currentRun, maxRuns, result)) {
      await retry(assert, callback, maxRuns, currentRun+1);
    } else {
      const message = result.message ? result.message + '\n' : '';
      result.message = message + '(Retried ' + maxRuns + ' times)';
      assert.pushResult(result);
    }
  };

  const retryTest = function(name, callback, maxRuns=2) {
    qunit.test(name, async function(assert) {
      await retry(assert, callback, maxRuns, 1);
    });
  };

  return retryTest;
}));
