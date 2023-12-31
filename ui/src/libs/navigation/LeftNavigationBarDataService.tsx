


export const fetchLeftNavigationStatus = () => {

    let result: boolean = false;

    // Check if the localStorage item exists
    const isMinimized = localStorage.getItem('leftNavigationBarIsMinimized');

    if (isMinimized !== null) {

        // Load the value from localStorage
        result = JSON.parse(isMinimized);


        // Use the value as needed
    } else {
        // Create the localStorage item with an initialization value
        const initialValue = false; // Example initialization value
        localStorage.setItem('leftNavigationBarIsMinimized', JSON.stringify(initialValue));
        result = initialValue;
    }

    // await new Promise((resolve) => setTimeout(resolve, 2000)); // Delay for simulation
    try {
        // const response = await axios.get('url/to/vaults'); // Replace with your API endpoint
        // return response.data;
        return result;
    } catch (error) {
        throw error;
    }
}