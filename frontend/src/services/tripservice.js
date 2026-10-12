const API_URL = "http://192.168.50.25:3000/api/trips";

export async function getTrips() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch trips");
    }

    return response.json();
}