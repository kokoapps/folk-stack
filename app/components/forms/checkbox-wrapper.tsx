import { type BaseProps } from "../base";

export default function CheckboxWrapper(props: BaseProps<"div">) {
  return <div className="flex items-center space-x-2" {...props} />;
}
