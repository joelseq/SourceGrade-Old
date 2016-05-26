module.exports = function (app) {
  app.use(require('./home'));
  app.use(require('./class'));
  app.use(require('./auth'));
};
