const mysql = require("mysql2/promise");
const config = require("config");

const { host, username, passwrd, port, dbname } = config.get("mysqldb");

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
    query: async function () {
        const queryArgs = Array.prototype.slice.call(arguments),
            events = [],
            eventNameIndex = {};

        console.log("SQL = ", queryArgs[0]);

        const conn = queryArgs[2] || pool;
        return new Promise((resolve, reject) => {
            conn.execute(queryArgs[0], queryArgs[1])
                .then((result) => {
                    resolve(result[0]);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    },

    // Lấy một kết nối để dùng trong transaction
    getConnection: async function () {
        try {
            return await pool.getConnection();
        } catch (err) {
            throw err; // Ném lỗi ra ngoài
        }
    },
};
