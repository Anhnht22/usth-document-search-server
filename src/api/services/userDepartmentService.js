const UserDepartmentCollection = require("../collections/userDepartmentCollection");
const UserDepartmentRepository = require("../repositories/userDepartmentRepository");
const ErrorResp = require("../../utils/errorUtils");
const DepartmentService = require("./departmentService");
const UserService = require("./userService");
const UserCollection = require("../collections/userCollection");

class UserDepartmentService {
    constructor() {
        this.col = new UserDepartmentCollection();
        this.repo = new UserDepartmentRepository();

        this.colUser = new UserCollection();
        this.repoUser = new UserDepartmentRepository();
    }

    async create(params, conn = null) {
        if (params.user_id === undefined || params.user_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "User id not found" },
                404
            );
        }

        this.colUser.filtersUser({ user_id: params.user_id, active: 1 });
        const [userData, userErr] = await this.handle(
            this.repoUser.list(this.colUser.finallize(false), conn)
        );

        if (userErr || !userData || userData.length < 1) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "User not found" },
                404
            );
        }
        if (userData[0].role_id == 3) {
            this.col.check({
                user_id: userData[0].user_id,
            });
            const sqlRole = this.col.finallize(true);
            let [roleCheck] = await this.handle(this.repo.list(sqlRole));

            if (roleCheck.length >= 1) {
                throw new ErrorResp(
                    { returnCode: 3, returnMessage: "The student has a department" },
                    404
                );
            }
        }

        if (params.department_id === undefined || params.department_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department id not found" },
                404
            );
        }
        
        const departmentService = new DepartmentService();
        const departmentData = await departmentService.list({
            department_id: params.department_id,
            active: 1,
        });
        if (departmentData.data.length < 1) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department not found" },
                404
            );
        }

        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck] = await this.handle(this.repo.list(sql));

        if (dataCheck.length >= 1) {
            throw new ErrorResp(
                { returnCode: 3, returnMessage: "User Department has existed" },
                404
            );
        }

        const [data] = await this.handle(this.repo.create(params, conn));
        if (data === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Create fail" },
                404
            );
        } else {
            return {
                returnCode: 200,
                returnMessage: "Create successfully",
                data: data,
            };
        }
    }

    async update(params, id) {
        if (params.user_id === undefined || params.user_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "User id not found" },
                404
            );
        }
        const userService = new UserService();
        const userData = await userService.list({
            user_id: params.user_id,
            active: 1,
        });
        if (userData.data.length < 1) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "User not found" },
                404
            );
        }
        if (params.department_id === undefined || params.department_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department id not found" },
                404
            );
        }
        const departmentService = new DepartmentService();
        const departmentData = await departmentService.list({
            department_id: params.department_id,
            active: 1,
        });
        if (departmentData.data.length < 1) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Department not found" },
                404
            );
        }

        this.col.check(params);
        const sql = this.col.finallize(true);
        let [dataCheck] = await this.handle(this.repo.list(sql));
        if (dataCheck.length >= 1 && dataCheck[0].user_department_id != id) {
            throw new ErrorResp(
                {
                    returnCode: 3,
                    returnMessage: "User Department already exists",
                },
                404
            );
        }

        const [data] = await this.handle(
            this.repo.updateByColumn("user_department_id", id, params)
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
                {
                    returnCode: 1,
                    returnMessage: "User Department ID not found",
                },
                404
            );
        }

        const [data] = await this.handle(
            this.repo.delete("user_department_id", id)
        );

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
                {
                    returnCode: 1,
                    returnMessage: "User Department ID not found",
                },
                404
            );
        }

        const [data] = await this.handle(
            this.repo.deletedPermanently("user_department_id", id)
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

module.exports = UserDepartmentService;
