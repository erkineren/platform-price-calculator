import { cn } from "@/lib/utils";
import Image from "next/image";

interface LogoProps {
    size?: number;
    className?: string;
}

export function Logo({ size = 32, className }: LogoProps) {
    return (
        <div className={cn("relative shrink-0", className)}>
            <Image src="/logo.svg" alt="Logo" width={size} height={size} />
        </div>
    );
} 