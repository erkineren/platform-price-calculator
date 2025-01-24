import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t bg-background">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-14 md:h-16 items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Built by{" "}
                        <Link
                            href="https://github.com/erkineren"
                            target="_blank"
                            className="font-medium underline underline-offset-4 hover:text-primary"
                        >
                            Erkin Eren
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <Link
                            href="https://github.com/erkineren/platform-price-calculator/issues"
                            target="_blank"
                            className="text-sm text-muted-foreground hover:text-primary"
                        >
                            Geri Bildirim
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
} 