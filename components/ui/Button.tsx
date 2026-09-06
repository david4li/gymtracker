import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "md" | "lg" | "icon";

const variantClasses: Record<Variant, string> = {
  primary: "bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 disabled:bg-orange-300",
  secondary:
    "bg-black/5 text-zinc-900 hover:bg-black/10 dark:bg-white/10 dark:text-zinc-50 dark:hover:bg-white/15",
  ghost: "bg-transparent text-zinc-700 hover:bg-black/5 dark:text-zinc-300 dark:hover:bg-white/10",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
};

const sizeClasses: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-14 px-6 text-base",
  icon: "h-10 w-10",
};

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(function Button({ className = "", variant = "primary", size = "md", ...props }, ref) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
});
