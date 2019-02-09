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

  // retryTest start
  const bufferResult = function(assert, callback, currentRun) {
    const original = assert.pushResult;
    let resultBuffer;
    assert.pushResult = function(result) {
      resultBuffer = result;
    }
    callback(assert, currentRun);
    assert.pushResult = original;
    return resultBuffer;
  };

  const retry = function(assert, callback, maxRuns, currentRun) {
    const result = bufferResult(assert, callback, currentRun);
    if (!result.result && currentRun < maxRuns ) {
      retry(assert, callback, maxRuns, currentRun+1);
    } else {
      const message = result.message ? result.message + '\n' : '';
      result.message = message + '(Retried ' + maxRuns + ' times)';
      assert.pushResult(result);
    }
  };

  const retryTest = function(name, callback, maxRuns=2) {
    qunit.test(name, function(assert) {
      retry(assert, callback.bind(this), maxRuns, 1);
    });
  };
  // retryTest end
  return retryTest;
}));
