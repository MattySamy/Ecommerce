/* eslint-disable node/no-unsupported-features/es-syntax */
const query = require("../config/query");

class ApiFeatures {
  constructor(mongooseQuery, queryString) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter(req) {
    const queryStringObj = { ...this.queryString };
    const excludedFields = [...Object.keys(query.query(req)), "sort", "fields"];
    excludedFields.forEach((el) => delete queryStringObj[el]);

    // Apply Filteration using ($gte, $gt, $lte, $lt)
    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const value = this.queryString.sort.split(",").join(" ");
      // ex: price,-sold => ['price', '-sold'] => price -sold
      this.mongooseQuery = this.mongooseQuery.sort(value);
    } else this.mongooseQuery = this.mongooseQuery.sort("-createdAt");

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.mongooseQuery = this.mongooseQuery.select(`${fields} -_id`);
    } else this.mongooseQuery = this.mongooseQuery.select("-__v");

    return this;
  }

  search(modelName) {
    if (this.queryString.keyword) {
      let queryObj = {};
      if (modelName === "Product") {
        // this needs mongoose@6.0.0
        queryObj = {
          $or: [
            { title: { $regex: this.queryString.keyword, $options: "i" } },
            {
              description: { $regex: this.queryString.keyword, $options: "i" },
            },
          ],
        };
      } else {
        queryObj = {
          $or: [
            {
              name: { $regex: this.queryString.keyword, $options: "i" },
            },
          ],
        };
      }

      this.mongooseQuery = this.mongooseQuery.find(queryObj);

      // // Another way with using Indexed Search
      // this.mongooseQuery = this.mongooseQuery.find({
      //   $text: {
      //     $search: this.queryString.keyword,
      //   },
      // });
    }
    return this;
  }

  paginate(req, countDocuments) {
    // Pagination Result
    const endIndex = query.query(req).page * query.query(req).limit;
    const pagination = {};
    pagination.currentPage = query.query(req).page;
    pagination.limit = query.query(req).limit;
    pagination.numberOfPages = Math.ceil(
      countDocuments / query.query(req).limit
    );

    if (endIndex < countDocuments) {
      pagination.nextPage = query.query(req).page + 1;
    }
    if (query.query(req).skip > 0) {
      pagination.previousPage = query.query(req).page - 1;
    }
    this.mongooseQuery = this.mongooseQuery
      .skip(query.query(req).skip)
      .limit(query.query(req).limit);

    this.paginationResult = pagination;

    return this;
  }
}

module.exports = ApiFeatures;
