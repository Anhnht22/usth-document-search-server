const DepartmentCollection = require("../collections/departmentCollection");
const DepartmentRepository = require("../repositories/departmentRepository");
const ErrorResp = require("../../utils/errorUtils");
const UserCollection = require("../collections/userCollection");
const UserRepository = require("../repositories/userRepository");
const UserDepartmentCollection = require("../collections/userDepartmentCollection");
const UserDepartmentRepository = require("../repositories/userDepartmentRepository");

class DepartmentService {
    constructor() {
        this.col = new DepartmentCollection();
        this.repo = new DepartmentRepository();

        this.colUser = new UserCollection();
        this.repoUser = new UserRepository();

        this.colUserDepartment = new UserDepartmentCollection();
        this.repoUserDepartment = new UserDepartmentRepository();
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

        const sqlPage = this.col.finallizeTotalCount(isLimit);
        const sql = this.col.finallize(isLimit);

        const [data, err] = await this.handle(this.repo.list(sql));

        if (err) {
            throw new ErrorResp({
                returnCode: 1,
                returnMessage: "Data not found",
                trace: err,
            });
        }

        const [total] = await this.handle(this.repo.list(sqlPage));

        const listId = data?.map((item) => item.department_id) || [];

        if (listId.length > 0) {
            this.colUserDepartment.addSelect([
                "t.department_id",
                "u.*"
            ]);

            this.colUserDepartment.join(`${this.colUser.table} u`, "u.user_id", "t.user_id", "LEFT");

            this.colUserDepartment.andWhereIn("t.department_id", "IN", listId.join(","));

            const sqlUserDepartment = this.colUserDepartment.finallize(false);
            const [dataUserDepartment, errUserDepartment] = await this.handle(this.repoUserDepartment.list(sqlUserDepartment));

            if (errUserDepartment) {
                throw new ErrorResp({
                    returnCode: 1,
                    returnMessage: "Data User Department not found",
                    trace: errUserDepartment,
                });
            }

            data.forEach((item) => {
                item.users = dataUserDepartment.filter((user) => user.department_id == item.department_id) || [];
            });
        }

        return {
            returnCode: 200,
            returnMessage: "Data successfully",
            total: total[0],
            data: data,
        };
    }

    async create(params) {
        if (params.department_name === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department name is required" },
                404
            );
        } else {
            let department_name = params.department_name;
            if (department_name.length === 0 || department_name.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Department name exceed character",
                    },
                    404
                );
            }
        }
        if (params.description === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Description is required" },
                404
            );
        } else {
            let description = params.description;
            if (description.length === 0 || description.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Description exceed character",
                    },
                    404
                );
            }
        }

        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck] = await this.handle(this.repo.list(sql));
        if (dataCheck.length >= 1) {
            throw new ErrorResp(
                { returnCode: 3, returnMessage: "Department has existed" },
                404
            );
        }

        const conn = await this.repo.getConnection();
        conn.beginTransaction();

        try {
            const [data, err] = await this.handle(
                this.repo.create(params, conn)
            );

            if (err) {
                throw new ErrorResp({
                    returnCode: 3,
                    returnMessage: "Create department fail",
                    trace: err,
                });
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
                { returnCode: 1, returnMessage: "Department ID not found" },
                404
            );
        }
        if (params.department_name === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department name is required" },
                404
            );
        } else {
            let department_name = params.department_name;
            if (department_name.length === 0 || department_name.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Department name exceed character",
                    },
                    404
                );
            }
        }
        if (params.description !== undefined) {
            let description = params.description;
            if (description.length === 0 || description.length >= 255) {
                throw new ErrorResp(
                    {
                        returnCode: 2,
                        returnMessage: "Description exceed character",
                    },
                    404
                );
            }
        }
        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck] = await this.handle(this.repo.list(sql));
        if (dataCheck.length >= 1 && dataCheck[0].department_id != id) {
            throw new ErrorResp(
                { returnCode: 3, returnMessage: "Department already exists" },
                404
            );
        }

        const [data] = await this.handle(
            this.repo.updateByColumn("department_id", id, params)
        );
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
                { returnCode: 1, returnMessage: "Department ID not found" },
                404
            );
        }

        const [data] = await this.handle(this.repo.delete("department_id", id));

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
            this.repo.deletedPermanently("department_id", id)
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

module.exports = DepartmentService;
