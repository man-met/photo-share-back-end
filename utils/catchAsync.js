/* 
all the async functions need to be wrapped with try catch block, we can create a catchAsync function so that we do not have to write try catch blocks.
*/
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
