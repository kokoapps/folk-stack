import { type BaseProps } from "../base";
import Button from "../button";

export default function SubmitButton(props: BaseProps<"button">) {
  return (
    <div className="flex justify-end">
      <Button {...props} />
    </div>
  );
}
