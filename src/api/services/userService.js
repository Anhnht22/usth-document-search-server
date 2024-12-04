const jwt = require("jsonwebtoken");
const config = require("config");
const ErrorResp = require("../../utils/errorUtils");
const UserCollection = require("../collections/userCollection");
const UserRepository = require("../repositories/userRepository");
const { getMD5Hash } = require("../../utils/stringUtils");
const RoleService = require("./roleService");
const UserDepartmentCollection = require("../collections/userDepartmentCollection");
const UserDepartmentRepository = require("../repositories/userDepartmentRepository");
const DepartmentCollection = require("../collections/departmentCollection");
const DepartmentRepository = require("../repositories/departmentRepository");
const RoleCollection = require("../collections/roleCollection");
const RoleRepository = require("../repositories/roleRepository");

class UserService {
    constructor() {
        this.col = new UserCollection();
        this.repo = new UserRepository();

        this.departmentCol = new DepartmentCollection();
        this.departmentRepo = new DepartmentRepository();

        this.userDepartmentCol = new UserDepartmentCollection();
        this.userDepartmentRepo = new UserDepartmentRepository();

        this.roleCol = new RoleCollection();
        this.roleRepo = new RoleRepository();
    }

    async list(params) {
        const { order } = params;

        let isLimit = true;

        // set default page, limit
        const page = 1;
        const limit = 10;

        // set paging
        if (params.page !== undefined) {
            if (params.limit !== undefined) this.col.setLimit(params.limit);
            this.col.setOffset(parseInt(params.page));
            this.col.setPage(parseInt(params.page));
        } else {
            this.col.setLimit(limit);
            this.col.setOffset(page);
            this.col.setPage(page);
        }
        //
        if (params.limit === -999) isLimit = false;

        this.col.filters(params);

        if (order) {
            Object.entries(JSON.parse(order)).forEach(([key, value]) => {
                this.col.addSort(key, value);
            });
        }

        const sqlPage = this.col.sqlCount(isLimit);
        const sql = this.col.finallize(isLimit);

        const [data] = await this.handle(this.repo.list(sql));
        const [total] = await this.handle(this.repo.list(sqlPage));

        return {
            returnCode: 200,
            returnMessage: "Data successfully",
            total: total[0],
            data: data,
        };
    }

    async listUser(params) {
        const { order } = params;

        let isLimit = true;

        // set default page, limit
        const page = 1;
        const limit = 10;

        // set paging
        if (params.page !== undefined) {
            if (params.limit !== undefined) this.col.setLimit(params.limit);
            this.col.setOffset(parseInt(params.page));
            this.col.setPage(parseInt(params.page));
        } else {
            this.col.setLimit(limit);
            this.col.setOffset(page);
            this.col.setPage(page);
        }
        //
        if (params.limit === -999) isLimit = false;

        this.col.filtersUser(params);

        if (order) {
            Object.entries(JSON.parse(order)).forEach(([key, value]) => {
                this.col.addSort(key, value);
            });
        }

        const sqlPage = this.col.sqlCount(isLimit);
        const [total] = await this.handle(this.repo.list(sqlPage));

        const sql = this.col.finallize(isLimit);
        const [data, err] = await this.handle(this.repo.list(sql));
        if (err) {
            throw new ErrorResp({
                returnCode: 1,
                returnMessage: "Data not found",
                trace: err,
            });
        }

        const listUserId = [];
        data.forEach((item) => {
            listUserId.push(item.user_id);
        });

        return {
            returnCode: 200,
            returnMessage: "Data successfully",
            total: total[0],
            data: data,
        };
    }
    async signIn(params) {
        this.col.filters({
            username: params.username,
        });

        const sql = this.col.finallize(1);
        let [data, error] = await this.handle(this.repo.list(sql));

        if (error || !data || data.length <= 0 || data.length > 1) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Account not found" },
                404
            );
        }

        data = data[0];
        if (!Boolean(data.active)) {
            throw new ErrorResp({
                returnCode: 2,
                returnMessage: "Account not yet active",
            });
        }

        if (data.password !== params.password) {
            throw new ErrorResp({
                returnCode: 3,
                returnMessage: "Username or password not match",
            });
        }

        this.roleCol.filters({
            role_id: data.role_id,
        });
        const [roleData, roleErr] = await this.handle(
            this.repo.list(this.roleCol.finallize(false))
        );
        if (
            roleErr ||
            !roleData ||
            roleData.length < 1
        ) {
            throw new ErrorResp(
                {
                    returnCode: 1,
                    returnMessage: "Role not found",
                },
                404
            );
        }

        const secretKey = config.get("secretKey");
        const token = jwt.sign(
            {
                username: data.username,
                email: data.email,
                role: roleData[0].role_name,
            },
            secretKey,
            { expiresIn: "1h" }
        );

        return {
            returnCode: 200,
            returnMessage: "Login successfully",
            data: {
                token: token,
            },
        };
    }

    async listUserDepartment(params) {
        const { order } = params;

        let isLimit = true;

        // set default page, limit
        const page = 1;
        const limit = 10;

        // set paging
        if (params.page !== undefined) {
            if (params.limit !== undefined) this.col.setLimit(params.limit);
            this.col.setOffset(parseInt(params.page));
            this.col.setPage(parseInt(params.page));
        } else {
            this.col.setLimit(limit);
            this.col.setOffset(page);
            this.col.setPage(page);
        }
        //
        if (params.limit === -999) isLimit = false;

        this.col.filtersUserDepartment(params);
        if (order) {
            Object.entries(JSON.parse(order)).forEach(([key, value]) => {
                this.col.addSort(key, value);
            });
        }

        const sqlPage = this.col.sqlCount(isLimit);
        const sql = this.col.finallize(isLimit);

        const [data] = await this.handle(this.repo.list(sql));
        const [total] = await this.handle(this.repo.list(sqlPage));

        return {
            returnCode: 200,
            returnMessage: "Data successfully",
            total: total[0],
            data: data,
        };
    }

    async create(params) {
        if (params.username === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Username is required" },
                404
            );
        } else {
            let username = params.username;
            if (username.length === 0 || username.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Username exceed character",
                    },
                    404
                );
            }
        }
        if (params.email === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Email is required" },
                404
            );
        } else {
            let email = params.email;
            if (email.length === 0 || email.length >= 255) {
                throw new ErrorResp(
                    { returnCode: 2, returnMessage: "Email exceed character" },
                    404
                );
            }
        }
        if (params.password === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Password is required" },
                404
            );
        } else {
            let password = params.password;
            if (password.length === 0 || password.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Password exceed character",
                    },
                    404
                );
            }
        }

        if (params.role_id === undefined || params.role_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Role not found" },
                404
            );
        }

        this.roleCol.filters({
            role_id: params.role_id,
            active: 1,
        });
        const [roleData, roleErr] = await this.handle(
            this.repo.list(this.roleCol.finallize(false))
        );
        if (
            roleErr ||
            !roleData ||
            roleData.length < 1
        ) {
            throw new ErrorResp(
                {
                    returnCode: 1,
                    returnMessage: "Role not found",
                },
                404
            );
        }

        const conn = await this.repo.getConnection();
        conn.beginTransaction();

        try {
            const { department_ids, ...paramsCreate } = params;
            const [data, err] = await this.handle(
                this.repo.create(
                    {
                        ...paramsCreate,
                        password: getMD5Hash(paramsCreate.password),
                    },
                    conn
                )
            );

            if (err) {
                throw new ErrorResp(
                    {
                        returnCode: 1,
                        returnMessage: "Username or Email has existed",
                        trace: err,
                    },
                    404
                );
            }

            for (let i = 0; i < department_ids.length; i++) {
                const department_id = department_ids[i];

                this.departmentCol.filters({
                    department_id: department_id,
                    active: 1,
                });
                const [departmentData, departmentErr] = await this.handle(
                    this.repo.list(this.col.finallize(false))
                );

                if (
                    departmentErr ||
                    !departmentData ||
                    departmentData.length < 1
                ) {
                    throw new ErrorResp(
                        {
                            returnCode: 1,
                            returnMessage: "Department not found",
                        },
                        404
                    );
                }

                await this.handle(
                    this.userDepartmentRepo.create(
                        {
                            user_id: data.insertId,
                            department_id: department_id,
                            active: 1,
                        },
                        conn
                    )
                );
            }

            return {
                returnCode: 200,
                returnMessage: "Create successfully",
                data: data,
            };
        } catch (error) {
            conn.rollback();
            throw error;
        } finally {
            conn.commit();
            conn.release();
        }
    }

    async update(params, id) {
        if (id === undefined || id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "User ID not found" },
                404
            );
        }
        if (params.username !== undefined) {
            let username = params.username;
            if (username.length === 0 || username.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Username exceed character",
                    },
                    404
                );
            }
        }
        if (params.email !== undefined) {
            let email = params.email;
            if (email.length === 0 || email.length >= 255) {
                throw new ErrorResp(
                    { returnCode: 2, returnMessage: "Email exceed character" },
                    404
                );
            }
        }
        if (params.role_id !== undefined && params.role_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Role ID not found" },
                404
            );
        }
        const roleService = new RoleService();
        const roleData = await roleService.list({
            role_id: params.role_id,
            active: 1,
        });
        if (roleData.data.length < 1) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Role not found" },
                404
            );
        }
        const [data, err] = await this.handle(
            this.repo.updateByColumn("user_id", id, {
                ...params,
            })
        );

        if (data === undefined) {
            throw new ErrorResp(
                {
                    returnCode: 1,
                    returnMessage: "Username or Email has existed",
                },
                404
            );
        } else {
            return {
                returnCode: 200,
                returnMessage: "Update successfully",
                data: data,
            };
        }
    }

    async updatePass(params,id) {
        if (id === undefined || id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "User ID not found" },
                404
            );
        }
        if (params.password === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Password is required" },
                404
            );
        } else {
            let password = params.password
            if (password.length === 0 || password.length >= 255) {
                throw new ErrorResp(
                    { returnCode: 2, returnMessage: "Password exceed character" },
                    404
                );
            }
        }
        const [data, err] = await this.handle(this.repo.updateByColumn("user_id",id,{
            password: getMD5Hash(params.password),
        }));

        if (data === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Update fail" },
                404
            );
        } else {
            return {
                returnCode: 200,
                returnMessage: "Update successfully",
                data: data,
            };
        }
    }

    async delete(id) {
        if (id === undefined || id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "User not found" },
                404
            );
        }

        const [data] = await this.handle(this.repo.delete("user_id", id));
        if (data === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Delete fail" },
                404
            );
        } else {
            return {
                returnCode: 200,
                returnMessage: "Delete successfully",
                data: data,
            };
        }
    }

    async deletedPermanently(id) {
        if (id === undefined || id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department ID not found" },
                404
            );
        }

        const [data] = await this.handle(
            this.repo.deletedPermanently("user_id", id)
        );
        if (data === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Delete Permanently fail" },
                404
            );
        } else {
            return {
                returnCode: 200,
                returnMessage: "Delete Permanently successfully",
                data: data,
            };
        }
    }

    handle(promise) {
        return promise
            .then((data) => [data, undefined])
            .catch((error) => Promise.resolve([undefined, error]));
    }
}

module.exports = UserService;
