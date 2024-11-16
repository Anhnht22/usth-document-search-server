export const handleResponseAPI = (req, res, _service) => {
    return _service
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.status(err?.statusCode || 500).send(err.resp);
        });
};
