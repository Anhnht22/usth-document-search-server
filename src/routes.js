module.exports = function (app, version) {
    const userCtrl = require('./api/controllers/userController');
    app.use(`${version}/user`, userCtrl);

    const departmentCtrl = require('./api/controllers/departmentController');
    app.use(`${version}/department`, departmentCtrl);

    const documentController = require('./api/controllers/documentController');
    app.use(`${version}/document`, documentController);

    const reviewController = require('./api/controllers/reviewController');
    app.use(`${version}/review`, reviewController);
}