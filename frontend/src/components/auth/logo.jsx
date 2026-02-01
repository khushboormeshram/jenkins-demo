import { cn } from "@/lib/utils";

export const Logo = ({
  className,
  ...props
}) => {
  return (
    <img
      src="https://assets.aceternity.com/logo-dark.png"
      alt="logo"
      className={cn("size-7", className)}
      {...props} />
  );
};
