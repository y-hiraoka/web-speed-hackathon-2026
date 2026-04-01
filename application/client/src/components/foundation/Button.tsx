import { ComponentPropsWithRef, MouseEvent, ReactNode, useCallback } from "react";

interface Props extends ComponentPropsWithRef<"button"> {
  variant?: "primary" | "secondary";
  leftItem?: ReactNode;
  rightItem?: ReactNode;
  command?: string;
  commandfor?: string;
}

export const Button = ({
  variant = "primary",
  leftItem,
  rightItem,
  className,
  children,
  command,
  commandfor,
  onClick,
  ...props
}: Props) => {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      // Polyfill for Invoker Commands API (command/commandfor)
      if (command && commandfor) {
        const target = document.getElementById(commandfor) as HTMLDialogElement | null;
        if (target) {
          if (command === "show-modal") {
            if (!target.open) target.showModal();
          } else if (command === "close") {
            target.close();
          }
        }
      }
    },
    [onClick, command, commandfor],
  );

  return (
    <button
      className={`flex items-center justify-center gap-2 rounded-full px-4 py-2 border disabled:opacity-50 disabled:cursor-not-allowed ${variant === "primary" ? "bg-cax-brand text-cax-surface-raised hover:bg-cax-brand-strong border-transparent" : "bg-cax-surface text-cax-text-muted hover:bg-cax-surface-subtle border-cax-border"} ${className ?? ""}`}
      type="button"
      onClick={handleClick}
      {...props}
    >
      {leftItem}
      <span>{children}</span>
      {rightItem}
    </button>
  );
};
