import React from "react";
import { type BaseProps } from "../base";

const TextArea = React.forwardRef<HTMLTextAreaElement, BaseProps<"textarea">>(
  ({ as, ...rest }, ref) => {
    let Component = as || "textarea";
    return (
      <Component
        ref={ref}
        className="block w-full rounded-md border-gray-300 text-gray-800 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
        rows={5}
        {...rest}
      />
    );
  }
);

TextArea.displayName = "TextArea";
export default TextArea;
