import { type BaseProps } from "../base";

export default function Errors(props: BaseProps<"div">) {
  let Component = props.as || "div";
  return (
    <Component className="flex flex-col space-y-2 text-center" {...props} />
  );
}
