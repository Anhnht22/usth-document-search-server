class BaseService {
    constructor(col, repo) {
        this.col = col;
        this.repo = repo;
    }

    handle(promise) {
        return promise
            .then(data => ([data, undefined]))
            .catch(error => Promise.resolve([undefined, error]));
    }
}

module.exports = BaseService;