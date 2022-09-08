import clsx from "clsx";
import React from "react";

const Input = React.forwardRef<
  HTMLInputElement,
  JSX.IntrinsicElements["input"]
>(({ type = "text", className, ...props }, ref) => {
  return (
    <input
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
});

Input.displayName = "Input";
export default Input;
