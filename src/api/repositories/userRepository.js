const BaseRepository = require('./baseRepository');

const table = 'User';

class UserRepository extends BaseRepository {
    constructor() {
        super(table);
    }
}

module.exports = UserRepository;