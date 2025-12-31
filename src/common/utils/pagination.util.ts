export const getPagination = (page: number, limit: number) => {
  const take = limit;
  const skip = (page - 1) * limit;

  return { take, skip };
};

export const getPaginationMeta = (
  total: number,
  page: number,
  limit: number,
) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});
