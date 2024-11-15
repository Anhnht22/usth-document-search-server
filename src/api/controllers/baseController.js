export const handleResponseAPI = (req, res, _service) => {
    // return res.send('Hello World!');
    return _service
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            if (err.response) {
                const objRes = {
                    returnCode: err.response.status,
                    data: null,
                    returnMessage: err?.response?.statusText || err.message
                };
                res.status(err.response.status).send(objRes);
            } else {
                const objRes = {
                    returnCode: 500,
                    data: null,
                    returnMessage: `Service Error: 500 - ${err.message ? err.message : '__'}`
                };
                res.status(500).send(objRes);
            }
        });
}