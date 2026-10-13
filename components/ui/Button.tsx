import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

import styles from "./Button.module.css";

type ButtonVariant = "primary" | "outline" | "text";

type SharedProps = {
  children: ReactNode;
  className?: string;
  variant?: ButtonVariant;
};

type ButtonProps = SharedProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkButtonProps = SharedProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: ButtonProps | LinkButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  if ("href" in props && props.href) {
    const linkProps = props as LinkButtonProps;

    return (
      <Link className={classes} {...linkProps}>
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonProps;

  return (
    <button className={classes} {...buttonProps} type={buttonProps.type ?? "button"}>
      {children}
    </button>
  );
}
