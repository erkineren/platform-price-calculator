"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalculationResult, formatPercentage, formatPrice, MarketplacePriceCalculator } from "@/lib/calculator";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useState } from "react";
import { useForm, UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";

// Form Schemas
const baseSchema = z.object({
    productCost: z.string().min(1, "Ürün maliyeti gerekli").refine((val: string) => !isNaN(Number(val)) && Number(val) > 0, "Pozitif bir sayı olmalı"),
    commissionRate: z.string().min(1, "Komisyon oranı gerekli").refine((val: string) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, "0 ile 100 arasında olmalı"),
    vatRate: z.string().min(1, "KDV oranı gerekli").refine((val: string) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, "0 ile 100 arasında olmalı"),
    platformFixedCommission: z.string().min(1, "Platform sabit komisyonu gerekli").refine((val: string) => !isNaN(Number(val)) && Number(val) >= 0, "Pozitif bir sayı olmalı"),
});

const byPriceSchema = baseSchema.extend({
    sellingPrice: z.string().optional()
        .refine((val: string | undefined) => !val || (!isNaN(Number(val)) && Number(val) > 0), "Eğer girilirse pozitif bir sayı olmalı"),
});

const byProfitSchema = baseSchema.extend({
    targetProfit: z.string().min(1, "Hedef kar gerekli").refine((val: string) => !isNaN(Number(val)), "Geçerli bir sayı olmalı"),
});

const byProfitRateSchema = baseSchema.extend({
    targetProfitRate: z.string().min(1, "Hedef kar oranı gerekli").refine((val: string) => !isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, "0 ile 100 arasında olmalı"),
});

type FormData = z.infer<typeof byPriceSchema> & z.infer<typeof byProfitSchema> & z.infer<typeof byProfitRateSchema>;

// Form Field Component
interface FormFieldProps {
    label: string;
    id: string;
    type?: string;
    step?: string;
    placeholder?: string;
    register: UseFormRegisterReturn;
    error?: { message?: string };
    className?: string;
}

const FormField = ({ label, id, type = "text", step, placeholder, register, error, className }: FormFieldProps) => (
    <div className={className}>
        <Label htmlFor={id} className="text-sm font-medium text-muted-foreground">
            {label}
        </Label>
        <Input
            id={id}
            type={type}
            step={step}
            {...register}
            className={cn(
                "mt-1.5 h-12 rounded-xl bg-muted/50 px-4",
                error && "border-red-500 focus-visible:ring-red-500"
            )}
            placeholder={placeholder}
        />
        {error?.message && (
            <p className="text-sm text-red-500 mt-1">{error.message}</p>
        )}
    </div>
);

// Result Item Component
interface ResultItemProps {
    label: string;
    value: string;
    isPercentage?: boolean;
    variant?: 'default' | 'profit' | 'price' | 'minimum';
}

const ResultItem = ({ label, value, isPercentage, variant = 'default' }: ResultItemProps) => {
    const getValueStyles = () => {
        switch (variant) {
            case 'profit':
                const isNegative = value.includes('-');
                return isNegative ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400';
            case 'price':
                return 'text-blue-500 dark:text-blue-400';
            case 'minimum':
                return 'text-purple-500 dark:text-purple-400';
            default:
                return isPercentage ? 'text-blue-600 dark:text-blue-400' : 'text-foreground';
        }
    };

    return (
        <div className="flex justify-between items-center py-3 border-b border-border last:border-0">
            <span className="text-muted-foreground text-sm">{label}</span>
            <span className={cn(
                "font-medium text-base",
                getValueStyles()
            )}>
                {value}
            </span>
        </div>
    );
};

export function PriceCalculator() {
    const [result, setResult] = useState<CalculationResult | null>(null);
    const [activeTab, setActiveTab] = useState<"byPrice" | "byProfit" | "byProfitRate">("byPrice");
    const [isCalculating, setIsCalculating] = useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
        resolver: zodResolver(
            activeTab === "byPrice"
                ? byPriceSchema
                : activeTab === "byProfit"
                    ? byProfitSchema
                    : byProfitRateSchema
        ),
        defaultValues: {
            productCost: "100",
            commissionRate: "21.5",
            vatRate: "20",
            platformFixedCommission: "6.99",
        }
    });

    const calculatePrices = useCallback(async (data: FormData) => {
        setIsCalculating(true);
        try {
            const calculator = new MarketplacePriceCalculator(
                Number(data.productCost),
                data.sellingPrice ? Number(data.sellingPrice) : undefined,
                Number(data.commissionRate) / 100,
                activeTab === "byProfit" ? Number(data.targetProfit) : undefined,
                activeTab === "byProfitRate" ? Number(data.targetProfitRate) / 100 : undefined,
                Number(data.vatRate) / 100,
                Number(data.platformFixedCommission)
            );

            await new Promise(resolve => setTimeout(resolve, 500));
            const results = calculator.calculatePrices();
            setResult(results);
        } catch (error) {
            console.error(error);
        } finally {
            setIsCalculating(false);
        }
    }, [activeTab]);

    const onSubmit = (data: FormData) => {
        calculatePrices(data);
    };

    return (
        <div className="w-full bg-background sm:bg-muted/50">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-start py-6">
                    <Card className="shadow-lg rounded-none sm:rounded-xl border-0 sm:border lg:sticky lg:top-20">
                        <CardContent className="pt-6">
                            <Tabs
                                value={activeTab}
                                onValueChange={(value: string) => {
                                    setActiveTab(value as "byPrice" | "byProfit" | "byProfitRate");
                                    reset();
                                    setResult(null);
                                }}
                                className="w-full"
                            >
                                <TabsList className="grid grid-cols-3 h-12 p-1 bg-muted/50 rounded-xl mb-6">
                                    <TabsTrigger value="byPrice" className="rounded-lg data-[state=active]:bg-background">Fiyata Göre</TabsTrigger>
                                    <TabsTrigger value="byProfit" className="rounded-lg data-[state=active]:bg-background">Kara Göre</TabsTrigger>
                                    <TabsTrigger value="byProfitRate" className="rounded-lg data-[state=active]:bg-background">Orana Göre</TabsTrigger>
                                </TabsList>

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="space-y-4">
                                        <FormField
                                            label="Ürün Maliyeti (TL)"
                                            id="productCost"
                                            type="number"
                                            step="0.01"
                                            register={register("productCost")}
                                            error={errors.productCost}
                                        />
                                        <FormField
                                            label="Komisyon Oranı (%)"
                                            id="commissionRate"
                                            type="number"
                                            step="0.01"
                                            register={register("commissionRate")}
                                            error={errors.commissionRate}
                                        />
                                        <FormField
                                            label="KDV Oranı (%)"
                                            id="vatRate"
                                            type="number"
                                            step="0.01"
                                            register={register("vatRate")}
                                            error={errors.vatRate}
                                        />
                                        <FormField
                                            label="Platform Sabit Komisyonu (TL)"
                                            id="platformFixedCommission"
                                            type="number"
                                            step="0.01"
                                            register={register("platformFixedCommission")}
                                            error={errors.platformFixedCommission}
                                        />
                                    </div>

                                    <TabsContent value="byPrice">
                                        <FormField
                                            label="Satış Fiyatı (TL) (Opsiyonel)"
                                            id="sellingPrice"
                                            type="number"
                                            step="0.01"
                                            register={register("sellingPrice")}
                                            error={errors.sellingPrice}
                                            placeholder="Minimum fiyat hesabı için boş bırakın"
                                        />
                                    </TabsContent>

                                    <TabsContent value="byProfit">
                                        <FormField
                                            label="Hedef Kar (TL)"
                                            id="targetProfit"
                                            type="number"
                                            step="0.01"
                                            register={register("targetProfit")}
                                            error={errors.targetProfit}
                                        />
                                    </TabsContent>

                                    <TabsContent value="byProfitRate">
                                        <FormField
                                            label="Hedef Kar Oranı (%)"
                                            id="targetProfitRate"
                                            type="number"
                                            step="0.01"
                                            register={register("targetProfitRate")}
                                            error={errors.targetProfitRate}
                                        />
                                    </TabsContent>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-base rounded-xl"
                                        disabled={isCalculating}
                                    >
                                        {isCalculating ? "Hesaplanıyor..." : "Hesapla"}
                                    </Button>
                                </form>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <AnimatePresence>
                        {result && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.2 }}
                                className="lg:mt-0"
                            >
                                <Card className="shadow-lg rounded-none sm:rounded-xl border-0 sm:border lg:sticky lg:top-20">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">Sonuçlar</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs defaultValue="costs" className="w-full">
                                            <TabsList className="grid grid-cols-2 h-12 p-1 bg-muted/50 rounded-xl mb-6">
                                                <TabsTrigger
                                                    value="costs"
                                                    className="rounded-lg data-[state=active]:bg-background"
                                                >
                                                    Maliyet & Fiyatlar
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="percentages"
                                                    className="rounded-lg data-[state=active]:bg-background"
                                                >
                                                    Yüzdeler
                                                </TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="costs" className="mt-0">
                                                <div className="space-y-1">
                                                    {Object.entries({
                                                        "Ürün Maliyeti": result.productCost,
                                                        "Kargo Maliyeti": result.shippingCost,
                                                        "Komisyon Maliyeti": result.commissionCost,
                                                        "Platform Hizmet Bedeli": result.fixedPlatformCommissionCost,
                                                        "KDV": result.vatCost,
                                                        "Minimum Satış Fiyatı": result.minimumSalePrice,
                                                        "Satış Fiyatı": result.salePrice,
                                                        "Kar": result.profit,
                                                    }).map(([label, value]) => (
                                                        <ResultItem
                                                            key={label}
                                                            label={label}
                                                            value={formatPrice(value)}
                                                            variant={
                                                                label === "Kar" ? "profit" :
                                                                    label === "Satış Fiyatı" ? "price" :
                                                                        label === "Minimum Satış Fiyatı" ? "minimum" :
                                                                            "default"
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="percentages" className="mt-0">
                                                <div className="space-y-1">
                                                    {Object.entries({
                                                        "Alış": result.rates.purchasePercentage,
                                                        "Komisyon": result.rates.commissionPercentage,
                                                        "Toplam KDV": result.rates.totalVatPercentage,
                                                        "Kargo": result.rates.shippingPercentage,
                                                        "Platform Hizmet": result.rates.fixedPlatformCommissionPercentage,
                                                        "Kar": result.rates.profitPercentage,
                                                    }).map(([label, value]) => (
                                                        <ResultItem
                                                            key={label}
                                                            label={label}
                                                            value={formatPercentage(value)}
                                                            isPercentage
                                                        />
                                                    ))}
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
} 