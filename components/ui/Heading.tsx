import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import styles from "./Heading.module.css";

type HeadingSize = "display" | "section" | "feature";

type HeadingProps<T extends ElementType = "h2"> = {
  as?: T;
  children: ReactNode;
  className?: string;
  size?: HeadingSize;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

export function Heading<T extends ElementType = "h2">({
  as,
  children,
  className,
  size = "section",
  ...props
}: HeadingProps<T>) {
  const Component = as ?? "h2";

  return (
    <Component className={[styles.heading, styles[size], className].filter(Boolean).join(" ")} {...props}>
      {children}
    </Component>
  );
}
