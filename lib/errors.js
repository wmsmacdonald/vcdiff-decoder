'use strict';

function CustomErrors(names) {
  let errors = {};
  names.forEach(name => {
    function CustomError(message) {
      this.name = name;
      this.message = message;
    }
    CustomError.prototype = Object.create(Object.prototype);
    CustomError.prototype.constructor = errors[name];
    errors[name] = CustomError;
  });
  return errors;
}

module.exports = CustomErrors(['NotImplemented', 'InvalidDelta']);