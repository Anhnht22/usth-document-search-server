const db = require("../../adapter/mySqlClient");

class BaseRepository {
    constructor(table) {
        this.table = table;
        this.db = db;
    }

    async getConnection() {
        return await this.db.connection.getConnection();
    }

    list(sql, conn = null) {
        return new Promise((resolve, reject) => {
            this.db.connection
                .query(sql, null, conn)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    }

    listCount(sql) {
        return new Promise((resolve, reject) => {
            this.db.connection
                .query(sql)
                .then((rows) => {
                    if (rows.length == 0) {
                        resolve(null);
                    }

                    var string = JSON.stringify(rows);
                    var json = JSON.parse(string);

                    resolve(json[0]);
                })
                .catch((err) => reject(err));
        });
    }

    show(sql) {
        return new Promise((resolve, reject) => {
            this.db.connection
                .query(sql)
                .then((rows) => {
                    if (rows.length == 0) {
                        resolve(null);
                    }

                    var string = JSON.stringify(rows);
                    var json = JSON.parse(string);

                    resolve(json[0]);
                })
                .catch((err) => reject(err));
        });
    }

    showByColumn(value, column) {
        const sql = `SELECT t.*
                     FROM ${this.table} t
                     WHERE t.${column} = ${value} LIMIT 1`;
        return new Promise((resolve, reject) => {
            this.db.connection
                .query(sql)
                .then((rows) => {
                    if (rows.length == 0) {
                        resolve(null);
                    }

                    var string = JSON.stringify(rows);
                    var json = JSON.parse(string);

                    resolve(json[0]);
                })
                .catch((err) => reject(err));
        });
    }

    showByColumnManyColumn(params) {
        let keys = Object.keys(params);
        let values = Object.values(params);

        let stringKeys = "";
        let objectParams = [];
        for (let i = 0; i < keys.length; i++) {
            if (![undefined, null].includes(values[i])) {
                stringKeys +=
                    (stringKeys === "" ? keys[i] : " AND " + keys[i]) + "=?";
                objectParams.push(values[i]);
            }
        }

        const sql = `SELECT *
                     FROM ${this.table}
                     WHERE ${stringKeys} LIMIT 1`;
        return new Promise((resolve, reject) => {
            this.db.connection
                .query(sql, objectParams)
                .then((rows) => {
                    if (rows.length == 0) {
                        resolve(null);
                    }

                    var string = JSON.stringify(rows);
                    var json = JSON.parse(string);

                    resolve(json[0]);
                })
                .catch((err) => reject(err));
        });
    }

    create(params, conn = null) {
        let keys = Object.keys(params);
        let values = Object.values(params);

        let stringKeys = "";
        let stringValues = "";
        let objectParams = [];
        for (let i = 0; i < keys.length; i++) {
            if (![undefined, null].includes(values[i])) {
                stringKeys += stringKeys === "" ? keys[i] : ", " + keys[i];
                stringValues += stringValues === "" ? `?` : `, ?`;
                objectParams.push(values[i]);
            }
        }

        const sql = `INSERT INTO ${this.table}(${stringKeys})
                     VALUES (${stringValues})`;

        return new Promise((resolve, reject) => {
            this.db.connection
                .query(sql, objectParams, conn)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    }

    update(id, params) {
        let keys = Object.keys(params);
        let values = Object.values(params);

        let stringKeys = "";
        let objectParams = [];
        for (let i = 0; i < keys.length; i++) {
            if (values[i]) {
                stringKeys +=
                    stringKeys === "" ? `${keys[i]}=?` : `, ${keys[i]}=?`;
                objectParams.push(values[i]);
            }
        }

        objectParams.push(id);
        let sql = `UPDATE ${this.table}
                   SET ${stringKeys}
                   WHERE ${this.table}_id = ?`;

        return new Promise((resolve, reject) => {
            this.db.connection
                .query(sql, objectParams)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    }

    updateByColumn(column, value, params) {
        let keys = Object.keys(params);
        let values = Object.values(params);

        let stringKeys = "";
        let objectParams = [];
        for (let i = 0; i < keys.length; i++) {
            if (![undefined, null].includes(values[i])) {
                stringKeys +=
                    stringKeys === "" ? `${keys[i]}=?` : `, ${keys[i]}=?`;
                objectParams.push(values[i]);
            }
        }

        objectParams.push(value);
        let sql = `UPDATE ${this.table}
                   SET ${stringKeys}
                   WHERE ${column} = ?`;

        return new Promise((resolve, reject) => {
            this.db.connection
                .query(sql, objectParams)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    }

    delete(column, value) {
        let objectParams = [];

        objectParams.push(value);
        let sql = `UPDATE ${this.table}
                   SET active = 0
                   WHERE ${column} = ?`;

        return new Promise((resolve, reject) => {
            this.db.connection
                .query(sql, objectParams)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    }

    deletedPermanently(column, id) {
        let objectParams = [];

        objectParams.push(id);
        let sql = `DELETE FROM ${this.table} WHERE ${column} = ?`;

        return new Promise((resolve, reject) => {
            this.db.connection
                .query(sql, objectParams)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    }

    updateByManyColumn(paramsWhereClause, params) {
        let keys = Object.keys(params);
        let values = Object.values(params);

        let keysWhereClause = Object.keys(paramsWhereClause);
        let valuesWhereClause = Object.values(paramsWhereClause);

        let objectParams = [];

        let stringKeys = "";
        for (let i = 0; i < keys.length; i++) {
            if (![undefined, null].includes(values[i])) {
                stringKeys +=
                    stringKeys === "" ? `${keys[i]}=?` : `, ${keys[i]}=?`;
                objectParams.push(values[i]);
            }
        }

        let stringKeysWhereClause = "";
        for (let i = 0; i < keysWhereClause.length; i++) {
            if (![undefined, null].includes(valuesWhereClause[i])) {
                stringKeysWhereClause +=
                    stringKeysWhereClause === ""
                        ? `${keysWhereClause[i]}=?`
                        : ` AND ${keysWhereClause[i]}=?`;
                objectParams.push(valuesWhereClause[i]);
            }
        }

        let sql = `UPDATE ${this.table}
                   SET ${stringKeys}
                   WHERE ${stringKeysWhereClause}`;

        return new Promise((resolve, reject) => {
            this.db.connection
                .query(sql, objectParams)
                .then((res) => resolve(res))
                .catch((err) => reject(err));
        });
    }

    executeSql(sql) {
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, (err, rows) => {
                if (err) reject(err);
                else {
                    resolve(rows);
                }
            });
        });
    }

    updateMulti(sqls) {
        const arrPromise = sqls.map((sql) => {
            return new Promise((resolve, reject) => {
                this.db.connection.query(sql, (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows);
                });
            });
        });

        return Promise.race(arrPromise);
    }

    getCountFiltered(sql) {
        return new Promise((resolve, reject) => {
            this.db.connection.query(sql, (err, rows) => {
                if (err) reject(err);
                else {
                    resolve(rows[0].total);
                }
            });
        });
    }

    catchError(error) {
        if (error.response.status === 401) {
            return {
                returnCode: 401,
                data: null,
                returnMessage: "Không có quyền truy cập",
            };
        } else {
            return { returnCode: 99, data: null, returnMessage: "Lỗi" };
        }
    }
}

module.exports = BaseRepository;
