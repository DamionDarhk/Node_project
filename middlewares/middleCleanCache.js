const {clearHash} = require('../services/cache.js');

module.exports = async (req, res, next) => {
  await next();
  /*our middlewares architecture is designed in such a way that it won't allow another middleware after the API reqest, so we are using
  in here*/
  clearHash(req.user.id);
}
