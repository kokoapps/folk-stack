import clsx from "clsx";

export type BaseVariants = "solid" | "outline" | "ghost";
export type BaseSizes = "xs" | "sm" | "md" | "lg" | "xl";
export type BaseColors = "red" | "blue" | "green" | "yellow" | "gray";

export const DefaultBaseProps = {
  variant: "solid" as BaseVariants,
  size: "md" as BaseSizes,
  color: "blue" as BaseColors,
};

export const FontSizeStyles = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export const BaseVariantStyles = {
  solid: "bg-blue-500 text-white",
  outline: "border border-blue-500 text-blue-500",
  ghost: "text-blue-500",
};

export const BaseColorStyles = {
  red: "bg-red-500 text-white",
  blue: "bg-blue-500 text-white",
  green: "bg-green-500 text-white",
  yellow: "bg-yellow-500 text-white",
  gray: "bg-gray-500 text-white",
};

export function getBaseVariantStyles(variant: BaseVariants): string {
  return BaseVariantStyles[variant];
}

export function getBaseColorStyles(color: BaseColors): string {
  return BaseColorStyles[color];
}

export function getFontSizeStyles(size: BaseSizes): string {
  return FontSizeStyles[size];
}

export function getBaseStyles({
  variant,
  color,
  size,
}: {
  variant?: BaseVariants;
  color?: BaseColors;
  size?: BaseSizes;
}): string {
  let _styles = Object.assign({}, DefaultBaseProps, { variant, color, size });
  return clsx(
    getBaseVariantStyles(_styles.variant),
    getBaseColorStyles(_styles.color),
    getFontSizeStyles(_styles.size)
  );
}

type PropsOf<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  E extends keyof JSX.IntrinsicElements | React.JSXElementConstructor<any>
> = JSX.LibraryManagedAttributes<E, React.ComponentPropsWithRef<E>>;

export interface BoxOwnProps<E extends React.ElementType = React.ElementType> {
  as?: E;
}

export type BoxProps<E extends React.ElementType> = BoxOwnProps<E> &
  Omit<PropsOf<E>, keyof BoxOwnProps>;

export type PolymorphicComponentProps<E extends React.ElementType, P> = P &
  BoxProps<E>;

export type BaseProps<
  T extends React.ElementType,
  Variants extends string = BaseVariants
> = {
  as?: T;
  variant?: Variants;
  color?: BaseColors;
  size?: BaseSizes;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;
