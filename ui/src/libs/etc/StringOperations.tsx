export function convertToDollarString(amount: number | undefined): string {
    if (typeof amount === "undefined") {
        return "N/A"
    } else {
        return amount!.toFixed(2) + " $"
    }
}