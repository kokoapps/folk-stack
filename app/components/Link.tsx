import { Link as RemixLink, type LinkProps } from "@remix-run/react";
import clsx from "clsx";

export function Link(props: LinkProps) {
  return <RemixLink {...props} className={clsx("text-gray-500 underline")} />;
}

export function ExternalLink(props: JSX.IntrinsicElements["a"]) {
  const { children, ...rest } = props;
  return (
    <a {...rest} className={clsx("text-gray-500 underline")}>
      {children}
    </a>
  );
}
