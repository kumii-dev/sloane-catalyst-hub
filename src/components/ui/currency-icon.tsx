import { cn } from "@/lib/utils";

interface CurrencyIconProps {
  className?: string;
}

export const CurrencyIcon = ({ className }: CurrencyIconProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center font-bold",
        className
      )}
    >
      R
    </div>
  );
};
