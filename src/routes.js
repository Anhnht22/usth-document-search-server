module.exports = function (app, version) {
    // điều hướng đến controller tương ứng theo api
    const userCtrl = require('./api/controllers/userController');
    app.use(`${version}/user`, userCtrl);

    const departmentCtrl = require('./api/controllers/departmentController');
    app.use(`${version}/department`, departmentCtrl);

    const subjectCtrl = require('./api/controllers/subjectController');
    app.use(`${version}/subject`, subjectCtrl);

    const topicController = require('./api/controllers/topicController');
    app.use(`${version}/topic`, topicController);

    const documentController = require('./api/controllers/documentController');
    app.use(`${version}/document`, documentController);

    const reviewController = require('./api/controllers/reviewController');
    app.use(`${version}/review`, reviewController);

    const roleController = require('./api/controllers/roleController');
    app.use(`${version}/role`, roleController);

    const userDepartmentController = require('./api/controllers/userDepartmentController');
    app.use(`${version}/userDepartment`, userDepartmentController);

    const subjectDepartmentController = require('./api/controllers/subjectDepartmentController');
    app.use(`${version}/subjectDepartment`, subjectDepartmentController);

    const keywordController = require('./api/controllers/keywordController');
    app.use(`${version}/keyword`, keywordController);
}