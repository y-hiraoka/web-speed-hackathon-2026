import { FontAwesomeIcon } from "@web-speed-hackathon-2026/client/src/components/foundation/FontAwesomeIcon";

interface Props {
  children: string | null;
}

export const ModalErrorMessage = ({ children }: Props) => {
  return (
    <span className={`text-cax-danger block ${!children ? "hidden" : ""}`}>
      <span className="mr-1">
        <FontAwesomeIcon iconType="exclamation-circle" styleType="solid" />
      </span>
      {children}
    </span>
  );
};
