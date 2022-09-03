import clsx from "clsx";
import { getBaseStyles, type BaseProps } from "./base";

function Button<T extends React.ElementType = "button">(props: BaseProps<T>) {
  let Component = props.as || "button";
  return <Component className={clsx(getBaseStyles(props))} {...props} />;
}

export default Button;
