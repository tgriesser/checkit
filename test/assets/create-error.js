//     create-error.js 0.2.1
//     (c) 2013 Tim Griesser
//     This source may be freely distributed under the MIT license.
(function(define) {

  "use strict";

  // A simple utility for subclassing the "Error"
  // object in multiple environments, while maintaining
  // relevant stack traces, messages, and prototypes.
  define(function() {

    var toString = Object.prototype.toString;

    // Creates an new error type with a "name",
    // and any additional properties that should be set
    // on the error instance.
    return function() {
      var args = new Array(arguments.length);
      for (var i = 0; i < args.length; ++i) {
        args[i] = arguments[i];
      }
      var name = getName(args);
      var target = getTarget(args);
      var properties = getProps(args);

      function ErrorCtor(message) {
        if (isObject(properties)) {
          var keys = inheritedKeys(properties);
          for (var i = 0, l = keys.length; i < l; ++i) {
            this[keys[i]] = clone(properties[keys[i]]);
          }
        }
        this.message = message;
        this.cause = message;
        if (message instanceof Error) {
          this.message = message.message;
          this.stack = message.stack;
        } else if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
        }
      }

      function Err() {
        this.constructor = ErrorCtor;
      }
      Err.prototype = target['prototype'];
      ErrorCtor.prototype = new Err();
      ErrorCtor.prototype.name = ('' + name) || 'CustomError';
      return ErrorCtor;
    };

    // Just a few helpers to clean up the function above
    // https://github.com/petkaantonov/bluebird/wiki/Optimization-killers
    function getName(args) {
      if (args.length === 0) return '';
      return isError(args[0]) ? (args[1] || '') : args[0];
    }

    function getTarget(args) {
      if (args.length === 0) return Error;
      return isError(args[0]) ? args[0] : Error;
    }

    function getProps(args) {
      if (args.length === 0) return null;
      return isError(args[0]) ? args[2] : args[1];
    }

    function inheritedKeys(obj) {
      var ret = [];
      for (var key in obj) {
        ret.push(key);
      }
      return ret;
    }

    // Right now we're just assuming that a function in the first argument is an error.
    function isError(obj) {
      return (typeof obj === "function");
    }

    // We don't need the full underscore check here, since it should either be
    // an object-literal, or nothing at all.
    function isObject(obj) {
      return (obj && typeof obj === "object" && toString.call(obj) === "[object Object]");
    }

    // Don't need the full-out "clone" mechanism here, since if you're
    // trying to set things other than empty arrays/objects on your
    // sub-classed `Error` object, you're probably doing it wrong.
    function clone(target) {
      if (target == null || typeof target !== "object") return target;
      var cloned = target.constructor ? target.constructor() : Object.create(null);
      for (var attr in target) {
        if (target.hasOwnProperty(attr)) {
          cloned[attr] = target[attr];
        }
      }
      return cloned;
    }

  });

  // Boilerplate UMD definition block...
})(function(createErrorLib) {
  if (typeof define === "function" && define.amd) {
    define(createErrorLib);
  } else if (typeof exports === 'object') {
    module.exports = createErrorLib();
  } else {
    var root = this;
    var lastcreateError = root.createError;
    var createError = root.createError = createErrorLib();
    createError.noConflict = function() {
      root.createError = lastcreateError;
      return createError;
    };
  }
});