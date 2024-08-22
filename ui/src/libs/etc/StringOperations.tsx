export function convertToXRDString(amount: number | undefined): string {
    if (typeof amount === "undefined") {
        return "N/A"
    } else {
        return "XRD " + amount!.toFixed(2)
    }
}

// Function overload signatures
export function convertToDollarString(amount: number | undefined): string;
export function convertToDollarString(amount: number | undefined, decimal_places: number): string;

// Single function implementation that handles both overloads
export function convertToDollarString(amount: number | undefined, decimal_places?: number): string {
    if (typeof amount === "undefined") {
        return "N/A";
    } else {
        const decimals = decimal_places !== undefined ? decimal_places : 2;
        return "$ " + amount.toFixed(decimals);
    }
}

export function convertToPercent(roi: number | undefined): string {
    if (roi == undefined) {
        return "N/A"
    } else {
        return (roi).toFixed(2) + " %"
    }
}

export function formatUnixTimestampToUTC(timestamp: number): string {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toISOString().replace('T', ' ').substr(0, 19);
}


export function convertTimeStamp(timestamp: string): string {
    const date = new Date(timestamp);

    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1; // Months are zero-indexed
    const day = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const seconds = date.getUTCSeconds();

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}