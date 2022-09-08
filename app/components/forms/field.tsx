import clsx from "clsx";

export default function Field({
  className,
  ...props
}: JSX.IntrinsicElements["div"]) {
  return (
    <div className={clsx("flex flex-col space-y-2", className)} {...props} />
  );
}
