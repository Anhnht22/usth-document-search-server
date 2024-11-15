const BaseService = require('./baseService');
const UserCollection = require('../collections/userCollection');
const UserRepository = require('../repositories/userRepository');

class UserService extends BaseService {
    constructor() {
        super(new UserCollection(), new UserRepository());
    }

    async list(params) {
        const sql = this.col.finallize(false);
        const [data, error] = await this.handle(this.repo.list(sql));

        return {returnCode: 0, data: data, returnMessage: "No Data"}
    }
}

module.exports = UserService;