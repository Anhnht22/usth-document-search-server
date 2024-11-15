module.exports = function (app, version) {
    const userCtrl = require('./api/controllers/userController');
    app.use(`${version}/user`, userCtrl);
}