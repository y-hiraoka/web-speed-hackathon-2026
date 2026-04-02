import { useCallback } from "react";
import { useLocation } from "react-router";

import { Link } from "@web-speed-hackathon-2026/client/src/components/foundation/Link";

interface Props {
  badge?: React.ReactNode;
  icon: React.ReactNode;
  text: string;
  href?: string;
  command?: string;
  commandfor?: string;
}

export const NavigationItem = ({ badge, href, icon, command, commandfor, text }: Props) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  const handleClick = useCallback(() => {
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
  }, [command, commandfor]);

  return (
    <li>
      {href !== undefined ? (
        <Link
          className={`hover:bg-cax-brand-soft flex h-12 w-12 flex-col items-center justify-center rounded-full sm:h-auto sm:w-24 sm:rounded-sm sm:px-2 lg:h-auto lg:w-auto lg:flex-row lg:justify-start lg:rounded-full lg:px-4 lg:py-2 ${isActive ? "text-cax-brand" : ""}`}
          to={href}
        >
          <span className="relative text-xl lg:pr-2 lg:text-3xl">
            {icon}
            {badge}
          </span>
          <span className="hidden sm:inline sm:text-sm lg:text-xl lg:font-bold">{text}</span>
        </Link>
      ) : (
        <button
          className="hover:bg-cax-brand-soft flex h-12 w-12 flex-col items-center justify-center rounded-full sm:h-auto sm:w-24 sm:rounded-sm sm:px-2 lg:h-auto lg:w-auto lg:flex-row lg:justify-start lg:rounded-full lg:px-4 lg:py-2"
          type="button"
          onClick={handleClick}
        >
          <span className="relative text-xl lg:pr-2 lg:text-3xl">
            {icon}
            {badge}
          </span>
          <span className="hidden sm:inline sm:text-sm lg:text-xl lg:font-bold">{text}</span>
        </button>
      )}
    </li>
  );
};
