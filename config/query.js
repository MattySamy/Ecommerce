exports.query = (req) => {
  const page = +req.query.page || 1;
  const limit = +req.query.limit || 5;
  const skip = (page - 1) * limit;
  const nextPage = page > 1;
  return { skip, limit, nextPage, page };
};
