import clsx from "clsx";
import { type BaseProps } from "../base";

export default function Label({ className, as, ...props }: BaseProps<"label">) {
  let Component = as || "label";
  return (
    <Component
      className={clsx(
        "block font-medium",
        className,
        !className && "text-gray-400"
      )}
      {...props}
    />
  );
}
