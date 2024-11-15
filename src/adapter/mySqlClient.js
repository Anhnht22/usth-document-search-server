const mysql = require('mysql2');
const config = require('config');

const {host, username, passwrd, port, dbname} = config.get("mysqldb")

const pool = mysql.createPool({
    connectionLimit: 10,
    waitForConnections: true,
    host: host,
    port: port,
    database: dbname,
    user: username,
    password: passwrd,
});

exports.connection = {
    query: function () {
        const queryArgs = Array.prototype.slice.call(arguments),
            events = [],
            eventNameIndex = {};

        console.log('SQL = ', queryArgs[0]);

        return new Promise((resolve, reject) => {
            pool.getConnection((err, client, release) => {
                if (err) return reject(err.message);

                pool.query(queryArgs[0], queryArgs[1], (err, result) => {
                    client.release();

                    try {
                        if (err) {
                            err.msg = err.message;
                            return reject(err);
                        } else {
                            return resolve(result);
                        }
                    } catch (ex) {
                        return reject(ex.name); // ex.message
                    }
                });
            });
        });
    }
};
