export interface ShippingCostRange {
    min: number;
    max: number;
    cost: number;
}

export interface CalculationResult {
    productCost: number;
    shippingCost: number;
    commissionCost: number;
    fixedPlatformCommissionCost: number;
    vatCost: number;
    minimumSalePrice: number;
    salePrice: number;
    profit: number;
    rates: {
        purchasePercentage: number;
        commissionPercentage: number;
        totalVatPercentage: number;
        shippingPercentage: number;
        fixedPlatformCommissionPercentage: number;
        profitPercentage: number;
    };
}

export class MarketplacePriceCalculator {
    private static readonly SHIPPING_COSTS: ShippingCostRange[] = [
        { min: 0, max: 100, cost: 32.5 },
        { min: 100, max: 200, cost: 61.99 },
        { min: 200, max: Number.MAX_VALUE, cost: 73.25 },
    ];

    private productCost: number;
    private sellingPrice?: number;
    private targetProfit?: number;
    private platformFixedCommission: number = 6.99;
    private commissionRate: number = 0.215;
    private vatRate: number = 0.20;
    private cargoVatRate: number = 0.20;
    private commissionVatRate: number = 0.20;
    private platformFixedCommissionVatRate: number = 0.20;

    constructor(
        productCost: number,
        sellingPrice?: number,
        commissionRate?: number,
        targetProfit?: number,
        targetProfitRate?: number,
        vatRate?: number,
        platformFixedCommission?: number
    ) {
        if (productCost <= 0) {
            throw new Error("Product cost must be greater than 0.");
        }

        this.productCost = productCost;
        this.sellingPrice = sellingPrice;
        this.targetProfit = targetProfit;

        if (commissionRate !== undefined) {
            this.commissionRate = commissionRate;
        }

        if (targetProfitRate !== undefined) {
            this.targetProfit = productCost * targetProfitRate;
        }

        if (vatRate !== undefined) {
            this.vatRate = vatRate;
        }

        if (platformFixedCommission !== undefined) {
            this.platformFixedCommission = platformFixedCommission;
        }
    }

    public calculatePrices(): CalculationResult {
        const minimumSalePrice = this.calculateMinimumSalePrice();
        const salePrice = this.targetProfit !== undefined
            ? this.calculateSalePriceForTargetProfit()
            : this.sellingPrice ?? minimumSalePrice;

        const vatCost = this.calculateVatCost(salePrice);
        const vatCostNotNegative = Math.max(vatCost, 0);

        const finalShippingCost = this.getShippingCost(salePrice);
        const commissionCost = salePrice * this.commissionRate;
        const fixedPlatformCommissionCost = this.calculatePlatformFixedCommissionCost();
        const profit = salePrice - this.productCost - finalShippingCost - commissionCost - fixedPlatformCommissionCost - vatCostNotNegative;

        return {
            productCost: Number(this.productCost.toFixed(2)),
            shippingCost: Number(finalShippingCost.toFixed(2)),
            commissionCost: Number(commissionCost.toFixed(2)),
            fixedPlatformCommissionCost: Number(fixedPlatformCommissionCost.toFixed(2)),
            vatCost: Number(vatCost.toFixed(2)),
            minimumSalePrice: Number(minimumSalePrice.toFixed(2)),
            salePrice: Number(salePrice.toFixed(2)),
            profit: Number(profit.toFixed(2)),
            rates: {
                purchasePercentage: Number(((this.productCost / salePrice) * 100).toFixed(2)),
                commissionPercentage: Number(((commissionCost / salePrice) * 100).toFixed(2)),
                totalVatPercentage: Number(((vatCost / salePrice) * 100).toFixed(2)),
                shippingPercentage: Number(((finalShippingCost / salePrice) * 100).toFixed(2)),
                fixedPlatformCommissionPercentage: Number(((fixedPlatformCommissionCost / salePrice) * 100).toFixed(2)),
                profitPercentage: Number(((profit / salePrice) * 100).toFixed(2)),
            }
        };
    }

    private calculateMinimumSalePrice(): number {
        let minimumSalePrice = this.productCost;

        while (true) {
            const shippingCost = this.getShippingCost(minimumSalePrice);
            const vatCost = this.calculateVatCost(minimumSalePrice);
            const vatCostNotNegative = Math.max(vatCost, 0);
            const fixedPlatformCommissionCost = this.calculatePlatformFixedCommissionCost();
            const newSalePrice = (this.productCost + shippingCost + fixedPlatformCommissionCost + vatCostNotNegative) / (1 - this.commissionRate);

            if (Math.abs(newSalePrice - minimumSalePrice) < 0.001) {
                break;
            }

            minimumSalePrice = newSalePrice;
        }

        return minimumSalePrice;
    }

    private calculateVatCost(salePrice: number): number {
        const saleVat = salePrice - (salePrice / (1 + this.vatRate));
        const purchaseVat = this.productCost - (this.productCost / (1 + this.vatRate));
        const cargoVat = this.getShippingCost(salePrice) - (this.getShippingCost(salePrice) / (1 + this.cargoVatRate));
        const commissionVat = salePrice * this.commissionRate - (salePrice * this.commissionRate / (1 + this.commissionVatRate));
        const fixedPlatformCommissionVat = this.calculatePlatformFixedCommissionCost() - (this.calculatePlatformFixedCommissionCost() / (1 + this.platformFixedCommissionVatRate));

        return saleVat - purchaseVat - cargoVat - commissionVat - fixedPlatformCommissionVat;
    }

    private calculatePlatformFixedCommissionCost(): number {
        return this.platformFixedCommission * (1 + this.platformFixedCommissionVatRate);
    }

    private calculateSalePriceForTargetProfit(): number {
        if (this.targetProfit === undefined) {
            throw new Error("Target profit is not set");
        }

        let salePrice = this.productCost;

        while (true) {
            const shippingCost = this.getShippingCost(salePrice);
            const vatCost = this.calculateVatCost(salePrice);
            const vatCostNotNegative = Math.max(vatCost, 0);
            const fixedPlatformCommissionCost = this.calculatePlatformFixedCommissionCost();
            const commissionCost = salePrice * this.commissionRate;
            const calculatedProfit = salePrice - this.productCost - shippingCost - commissionCost - fixedPlatformCommissionCost - vatCostNotNegative;

            if (Math.abs(calculatedProfit - this.targetProfit) < 0.001) {
                break;
            }

            salePrice += 0.001;
        }

        return salePrice;
    }

    private getShippingCost(salePrice: number): number {
        for (const range of MarketplacePriceCalculator.SHIPPING_COSTS) {
            if (salePrice >= range.min && salePrice < range.max) {
                return range.cost;
            }
        }

        throw new Error(`Unable to determine shipping cost for sale price: ${salePrice}`);
    }
}

export const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(value);
};

export const formatPercentage = (value: number): string => {
    return `%${Math.round(value)}`;
}; 