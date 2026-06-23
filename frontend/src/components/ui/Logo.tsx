import Image from "next/image";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="Nepex Cargo"
      width={134}
      height={62}
      priority
      className={`h-[42px] w-auto ${className}`}
    />
  );
}
