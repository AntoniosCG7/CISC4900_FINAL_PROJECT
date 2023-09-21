// This function takes in another function fn and it then returns a new function that invokes the original function and ensures that any promise rejection is passed to the next() function.

module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
