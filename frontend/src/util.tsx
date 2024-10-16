import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";

export const usePagination = (
  listData: any[],
  entitiesPerPage: number
): [any[], number, number, Dispatch<SetStateAction<number>>] => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = useMemo(
    () => Math.ceil(listData?.length / entitiesPerPage),
    [listData.length, entitiesPerPage]
  );

  const pageEntities = useMemo(() => {
    const skip = (currentPage - 1) * entitiesPerPage;
    return listData?.slice(skip, skip + entitiesPerPage);
  }, [currentPage, listData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [listData?.length]);

  return [pageEntities, totalPages, currentPage, setCurrentPage];
};

export const getTruncatedString = (str: string, maxLength: number) => {
  if (str.length > maxLength) {
    return `${str.slice(0, maxLength)}...`;
  }
  return str;
};
