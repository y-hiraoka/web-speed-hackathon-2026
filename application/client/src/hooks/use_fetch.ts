import { useEffect, useState } from "react";

interface ReturnValues<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
}

export function useFetch<T>(
  apiPath: string,
  fetcher: (apiPath: string) => Promise<T>,
): ReturnValues<T> {
  const [result, setResult] = useState<ReturnValues<T>>({
    data: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    setResult(() => ({
      data: null,
      error: null,
      isLoading: true,
    }));

    // Check for prefetched promise
    const prefetched = window.__PREFETCH__?.[apiPath];
    const dataPromise = prefetched
      ? (prefetched as Promise<T>).then((data) => {
          // Consume the prefetch so it's not reused on subsequent renders
          delete window.__PREFETCH__![apiPath];
          return data;
        })
      : fetcher(apiPath);

    void dataPromise.then(
      (data) => {
        setResult((cur) => ({
          ...cur,
          data,
          isLoading: false,
        }));
      },
      (error) => {
        setResult((cur) => ({
          ...cur,
          error,
          isLoading: false,
        }));
      },
    );
  }, [apiPath, fetcher]);

  return result;
}
