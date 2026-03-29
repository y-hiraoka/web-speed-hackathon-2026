import { useEffect } from "react";

export const DocumentTitle = ({ title }: { title: string }) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
  return null;
};
