import type { DetailedHTMLProps, HTMLAttributes, RefAttributes } from "react";

type GlassAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  tone?: "clear" | "tinted" | "light";
  radius?: string | number;
  backdrop?: string;
  blur?: string | number;
  href?: string;
  target?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "lg-button": GlassAttributes & RefAttributes<HTMLElement>;
      "lg-panel": GlassAttributes & RefAttributes<HTMLElement>;
      "lg-navbar": GlassAttributes & RefAttributes<HTMLElement>;
      "lg-switch": GlassAttributes & RefAttributes<HTMLElement>;
      "lg-segmented": GlassAttributes & RefAttributes<HTMLElement>;
    }
  }
}
