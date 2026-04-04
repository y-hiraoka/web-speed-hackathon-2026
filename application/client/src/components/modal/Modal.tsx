import { ComponentPropsWithRef, MouseEvent, useCallback } from "react";

interface Props extends ComponentPropsWithRef<"dialog"> {}

export const Modal = ({ className, children, onClick, ...props }: Props) => {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLDialogElement>) => {
      onClick?.(e);
      // Polyfill for closedby="any": close on backdrop click
      const dialog = e.currentTarget;
      if (e.target === dialog) {
        dialog.close();
      }
    },
    [onClick],
  );

  return (
    <dialog
      className={`backdrop:bg-cax-overlay/50 bg-cax-surface fixed inset-0 m-auto w-full max-w-[calc(min(var(--container-md),100%)-var(--spacing)*4)] rounded-lg p-4 ${className ?? ""}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </dialog>
  );
};
