import { Link as RemixLink } from "@remix-run/react";
import clsx from "clsx";
import { getBaseStyles, type BaseProps } from "./base";

function Link<T extends React.ElementType = typeof RemixLink>(
  props: BaseProps<T>
) {
  let Component = props.as || RemixLink;
  return (
    // @ts-ignore
    <Component {...props} className={clsx(getBaseStyles(props), "underline")} />
  );
}

export default Link;
