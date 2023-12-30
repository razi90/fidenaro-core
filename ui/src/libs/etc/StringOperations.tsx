export function convertToDollarString(amount: number | undefined): string {
    if (typeof amount === "undefined") {
        return "N/A"
    } else {
        return amount!.toFixed(2) + " $"
    }
}

export function convertToPercentPnl(total_amount: number | undefined, pnl_amount: number | undefined): string {
    if (typeof total_amount == undefined || pnl_amount == undefined || total_amount == 0) {
        return "N/A"
    } else {
        return (pnl_amount / total_amount! * 100).toFixed(2) + " %"
    }
}