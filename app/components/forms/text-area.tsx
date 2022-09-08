import React from "react";

const TextArea = React.forwardRef<
  HTMLTextAreaElement,
  JSX.IntrinsicElements["textarea"]
>((props, ref) => {
  return (
    <textarea
      ref={ref}
      className="block w-full rounded-md border-gray-300 text-gray-800 shadow-sm focus:border-pink-500 focus:ring-pink-500 sm:text-sm"
      rows={5}
      {...props}
    />
  );
});

TextArea.displayName = "TextArea";
export default TextArea;
