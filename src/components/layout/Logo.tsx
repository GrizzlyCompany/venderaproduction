import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  layout?: 'horizontal' | 'vertical';
}

export function Logo({ layout = 'horizontal' }: LogoProps) {
  const isVertical = layout === 'vertical';

  return (
    <div
      className={cn(
        'flex items-center',
        isVertical ? 'flex-col gap-4' : 'flex-row gap-2'
      )}
    >
      <Image
        src="https://qlbuwoyugbwpzzwdflsq.supabase.co/storage/v1/object/public/logo//logo3.png"
        alt="VENDRA Logo"
        width={isVertical ? 128 : 48}
        height={isVertical ? 128 : 48}
        className="object-contain"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
      <span
        className={cn(
          'font-bold tracking-tighter text-primary font-headline',
          isVertical ? 'text-5xl' : 'text-2xl'
        )}
      >
        VENDRA
      </span>
    </div>
  );
}
