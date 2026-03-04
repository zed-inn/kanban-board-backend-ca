export const getOffset = (perPage: number, page: number) => {
  if (typeof perPage !== "number" || isNaN(perPage)) perPage = 0;
  if (typeof page !== "number" || isNaN(page)) page = 1;

  return perPage * (page - 1);
};
