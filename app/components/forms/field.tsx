import clsx from "clsx";
import { type BaseProps } from "../base";

export default function Field({
  className,
  as,
  ...props
}: BaseProps<"fieldset">) {
  let Component = as || "fieldset";
  return (
    <Component
      className={clsx("flex flex-col space-y-2", className)}
      {...props}
    />
  );
}
