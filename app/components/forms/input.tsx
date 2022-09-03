import clsx from "clsx";
import React from "react";
import { type BaseProps } from "../base";

const Input = React.forwardRef<HTMLInputElement, BaseProps<"input">>(
  ({ type = "text", className, as, ...props }, ref) => {
    let Component = as || "input";
    return (
      <Component
        ref={ref}
        type={type}
        className={clsx(
          "block w-full rounded-md text-gray-800 shadow-sm sm:text-sm",
          className,
          !className &&
            "border-gray-300 focus:border-pink-500 focus:ring-pink-500"
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export default Input;
