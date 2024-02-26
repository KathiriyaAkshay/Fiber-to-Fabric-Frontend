import { useState } from "react";

export function usePagination({ initialPageSize = 10, initialPage = 0 } = {}) {
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(initialPage);

  const onPageChange = (pageNumber) => {
    setPage(pageNumber - 1);
  };

  const onShowSizeChange = (current, pageSize) => {
    setPageSize(pageSize);
  };

  return { page, pageSize, onPageChange, onShowSizeChange };
}
