'use strict';

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

function MyError() {
  var temp = Error.apply(this, arguments);
  temp.name = this.name = 'MyError';
  this.stack = temp.stack;
  this.message = temp.message;
}
//inherit prototype using ECMAScript 5 (IE 9+)
MyError.prototype = Object.create(Error.prototype, {
  constructor: {
    value: MyError,
    writable: true,
    configurable: true
  }
});

module.exports = CustomErrors(['NotImplemented', 'InvalidDelta']);