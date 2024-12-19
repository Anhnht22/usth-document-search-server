const ReviewCollection = require("../collections/reviewCollection");
const ReviewRepository = require("../repositories/reviewRepository");
const ErrorResp = require("../../utils/errorUtils");
const moment = require("moment");

class ReviewService {
    constructor() {
        this.col = new ReviewCollection();
        this.repo = new ReviewRepository();
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

        const [data] = await this.handle(this.repo.list(sql));
        const [total] = await this.handle(this.repo.list(sqlPage));

        return {
            returnCode: 200,
            returnMessage: "Data successfully",
            total: total[0],
            data: data,
        };
    }

    async create(params, userData, conn = null) {
        let date = +moment();
        if (params.document_id === undefined || params.document_id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Document is required" },
                404
            );
        }
        const [data, err] = await this.handle(
            this.repo.create({
                document_id: params.document_id,
                reviewer_id: userData.user_id,
                review_date: date,
                status: params.status,
                reason: params.reason,
                },
            conn
            )
        );

        if (err) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Create fail", trace: err },
                404
            );
        }

        return {
            returnCode: 200,
            returnMessage: "Create successfully",
            data: data,
        };
    }

    async update(params, id, userData) {
        let date = +moment();
        if (id === undefined || id == 0) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Review ID not found" },
                404
            );
        }
        if (params.status === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Status is required" },
                404
            );
        } else {
            let status = params.status;
            if (status.length === 0 || status.length >= 255) {
                throw new ErrorResp(
                    { returnCode: 2, returnMessage: "Status exceed character" },
                    404
                );
            }
        }

        const [data] = await this.handle(
            this.repo.updateByColumn("review_id", id, {
                status: params.status,
                reviewer_id: userData.user_id,
                review_date: date,
            })
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
                { returnCode: 1, returnMessage: "Review not found" },
                404
            );
        }

        const [data] = await this.handle(this.repo.delete("review_id", id));

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
                { returnCode: 1, returnMessage: "Review ID not found" },
                404
            );
        }

        const [data] = await this.handle(
            this.repo.deletedPermanently("review_id", id)
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

module.exports = ReviewService;
