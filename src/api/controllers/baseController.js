const handleResponseAPI = (req, res, _service) => {
    // return res.send('Hello World!');
    return _service
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            console.log(err);
            if (err?.resp) {
                res.status(err?.statusCode || 500).send(err.resp);
            } else {
                res.status(err?.statusCode || 500).send({
                    returnCode: 500,
                    returnMessage: err?.message || "Internal server error",
                    trace: { ...err?.trace, ...err } || "",
                });
            }
        });
};

module.exports = {
    handleResponseAPI,
};
