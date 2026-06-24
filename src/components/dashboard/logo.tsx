import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: number;
};

export function Logo({ className, size = 20 }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/icon.svg"
      alt="OpenCorp"
      width={size}
      height={size}
      style={{ width: size, height: "auto" }}
      className={cn("shrink-0", className)}
    />
  );
}
