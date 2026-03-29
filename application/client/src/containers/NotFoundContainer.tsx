import { DocumentTitle } from "@web-speed-hackathon-2026/client/src/components/foundation/DocumentTitle";
import { NotFoundPage } from "@web-speed-hackathon-2026/client/src/components/application/NotFoundPage";

export const NotFoundContainer = () => {
  return (
    <>
      <DocumentTitle title="ページが見つかりません - CaX" />
      <NotFoundPage />
    </>
  );
};
