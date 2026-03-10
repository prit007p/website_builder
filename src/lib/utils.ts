// Utility functions used throughout the app
// The `cn` (classNames) helper is commonly used to conditionally
// concatenate Tailwind-style class strings.

export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}
