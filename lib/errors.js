'use strict';
/**
 * Takes in array of names of errors and returns an object mapping those names to error functions that take in one parameter that is used as the message for the error
 * @param names {[]}
 * @returns {{name1: function(message),...}}
 * @constructor
 */
function CustomErrors(names) {
  let errors = {};
  names.forEach(name => {
    let CustomError = function CustomError(message) {
      var temp = Error.apply(this, arguments);
      temp.name = this.name = name;
      this.stack = temp.stack;
      this.message = temp.message;
      this.name = name;
      this.message = message;
    };
    CustomError.prototype = Object.create(Error.prototype, {
      constructor: {
        value: CustomError,
        writable: true,
        configurable: true
      }
    });
    errors[name] = CustomError;
  });
  return errors;
}

module.exports = CustomErrors(['NotImplemented', 'InvalidDelta']);