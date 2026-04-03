import { useCallback, useEffect, useRef, useState } from "react";

const LIMIT = 10;

interface ReturnValues<T> {
  data: Array<T>;
  error: Error | null;
  isLoading: boolean;
  fetchMore: () => void;
}

export function useInfiniteFetch<T>(
  apiPath: string,
  fetcher: (apiPath: string) => Promise<T[]>,
  initialData?: T[],
): ReturnValues<T> {
  const hasInitialData = initialData != null && initialData.length > 0;
  const internalRef = useRef({ isLoading: false, offset: hasInitialData ? initialData.length : 0 });

  const [result, setResult] = useState<Omit<ReturnValues<T>, "fetchMore">>({
    data: hasInitialData ? initialData : [],
    error: null,
    isLoading: !hasInitialData,
  });

  const fetchMore = useCallback(() => {
    if (!apiPath) {
      return;
    }
    const { isLoading, offset } = internalRef.current;
    if (isLoading) {
      return;
    }

    setResult((cur) => ({
      ...cur,
      isLoading: true,
    }));
    internalRef.current = {
      isLoading: true,
      offset,
    };

    const separator = apiPath.includes("?") ? "&" : "?";
    const paginatedPath = `${apiPath}${separator}limit=${LIMIT}&offset=${offset}`;

    void fetcher(paginatedPath).then(
      (data) => {
        setResult((cur) => ({
          ...cur,
          data: [...cur.data, ...data],
          isLoading: false,
        }));
        internalRef.current = {
          isLoading: false,
          offset: offset + LIMIT,
        };
      },
      (error) => {
        setResult((cur) => ({
          ...cur,
          error,
          isLoading: false,
        }));
        internalRef.current = {
          isLoading: false,
          offset,
        };
      },
    );
  }, [apiPath, fetcher]);

  const initialDataUsedRef = useRef(hasInitialData);

  useEffect(() => {
    // Skip the initial fetch if we already have SSR-provided data
    if (initialDataUsedRef.current) {
      initialDataUsedRef.current = false;
      return;
    }

    if (!apiPath) {
      setResult(() => ({
        data: [],
        error: null,
        isLoading: false,
      }));
      internalRef.current = {
        isLoading: false,
        offset: 0,
      };
      return;
    }

    setResult(() => ({
      data: [],
      error: null,
      isLoading: true,
    }));
    internalRef.current = {
      isLoading: false,
      offset: 0,
    };

    fetchMore();
  }, [apiPath, fetchMore]);

  return {
    ...result,
    fetchMore,
  };
}
