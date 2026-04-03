import useSWRInfinite from "swr/infinite";

const DEFAULT_LIMIT = 30;

interface UseInfiniteListOptions {
  limit?: number;
}

interface UseInfiniteListReturn<T> {
  data: T[];
  error: Error | undefined;
  isLoading: boolean;
  fetchMore: () => void;
}

export function useInfiniteList<T>(
  baseUrl: string | null,
  fetcher: (url: string) => Promise<T[]>,
  options?: UseInfiniteListOptions,
): UseInfiniteListReturn<T> {
  const limit = options?.limit ?? DEFAULT_LIMIT;

  const getKey = (pageIndex: number, previousPageData: T[] | null) => {
    if (baseUrl === null) return null;
    if (previousPageData && previousPageData.length < limit) return null;

    const separator = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${separator}limit=${limit}&offset=${pageIndex * limit}`;
  };

  const { data, error, isLoading, isValidating, size, setSize } = useSWRInfinite<T[]>(
    getKey,
    fetcher,
    { revalidateFirstPage: false },
  );

  const fetchMore = () => {
    const lastPage = data?.[data.length - 1];
    if (isValidating || (lastPage && lastPage.length < limit)) return;
    void setSize(size + 1);
  };

  return {
    data: data ? data.flat() : [],
    error,
    isLoading,
    fetchMore,
  };
}
