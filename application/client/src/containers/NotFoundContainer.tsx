import { NotFoundPage } from "@web-speed-hackathon-2026/client/src/components/application/NotFoundPage";
import { DocumentTitle } from "@web-speed-hackathon-2026/client/src/components/foundation/DocumentTitle";

export const NotFoundContainer = () => {
  return (
    <>
      <DocumentTitle title="ページが見つかりません - CaX" />
      <NotFoundPage />
    </>
  );
};
