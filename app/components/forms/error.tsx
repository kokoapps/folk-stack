import { type BaseProps } from "../base";

export default function Error(props: BaseProps<"div">) {
  let Component = props.as || "div";
  return <Component className="text-sm text-red-600" {...props} />;
}
