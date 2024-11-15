function auth(req, res, next) {
    console.log('Middleware is running...');

    // Check middleware
    // if (!req.headers['x-custom-header']) {
    //     return res.status(400).json({error: 'Missing custom header'});
    // }

    next();
}

module.exports = {
    auth
};