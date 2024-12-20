const KeywordCollection = require("../collections/keywordCollection");
const KeywordRepository = require("../repositories/keywordRepository");
const ErrorResp = require("../../utils/errorUtils");

class KeywordService {
    constructor() {
        this.col = new KeywordCollection();
        this.repo = new KeywordRepository();
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
        if (Number(params.limit) === -999) isLimit = false;

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

    async create(params) {
        if (params.keyword === undefined) {
            throw new ErrorResp(
                { returnCode: 1, returnMessage: "Keyword is required" },
                404
            );
        }

        this.col.check({
            keyword: params.keyword,
        });
        const sql = this.col.finallize(false);
        const [dataCheck, errCheck] = await this.handle(this.repo.list(sql));
        if (errCheck) {
            throw new ErrorResp({
                returnCode: 1,
                returnMessage: "Data not found",
                trace: errCheck,
            });
        }

        if (dataCheck && dataCheck.length > 0) {
            throw new ErrorResp({
                returnCode: 1,
                returnMessage: "Keyword is exist",
            });
        }

        const [data, err] = await this.handle(
            this.repo.create({
                keyword: params.keyword,
                active: 1,
            })
        );

        if (err) {
            throw new ErrorResp({
                returnCode: 1,
                returnMessage: "Create fail",
                trace: err,
            });
        }

        return {
            returnCode: 200,
            returnMessage: "Create successfully",
            data: data,
        };
    }

    handle(promise) {
        return promise
            .then((data) => [data, undefined])
            .catch((error) => Promise.resolve([undefined, error]));
    }
}

module.exports = KeywordService;
