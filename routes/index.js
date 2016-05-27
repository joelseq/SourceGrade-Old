module.exports = function (app) {
  app.use(require('./class'));
  app.use(require('./auth'));
  app.use(require('./home'));
};
