import Link from "next/link";
import { Logo } from "@/components/ui/logo";

function GitHubIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="currentColor"
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
        </svg>
    );
}

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-center py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link href="/" className="inline-flex">
                                <Logo size={40} />
                            </Link>
                            <div>
                                <Link href="/" className="inline-flex">
                                    <h1 className="font-bold text-lg sm:text-xl">Pazar Yeri Fiyat Hesaplayıcı</h1>
                                </Link>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                                    Pazar yeri ürünleriniz için fiyat, kar ve maliyet hesaplayın
                                </p>
                            </div>
                        </div>
                        <div className="sm:hidden">
                            <Link
                                href="https://github.com/erkineren/platform-price-calculator"
                                target="_blank"
                                className="flex items-center p-2 text-muted-foreground hover:text-primary transition-colors"
                                aria-label="GitHub Repository"
                            >
                                <GitHubIcon />
                            </Link>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center ml-auto">
                        <Link
                            href="https://github.com/erkineren/platform-price-calculator"
                            target="_blank"
                            className="flex items-center p-2 text-muted-foreground hover:text-primary transition-colors"
                            aria-label="GitHub Repository"
                        >
                            <GitHubIcon />
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
} 