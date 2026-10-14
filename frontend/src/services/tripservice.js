const API_URL =
    "https://appsolutelyclueless-afhnauf5cqc4bvek.francecentral-01.azurewebsites.net/api/trips";

    // Get all trips from backend
    export async function getTrips() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error("Failed to fetch trips");
    }

    return response.json();
    }

    // Create a new trip
    export async function createTrip(tripData) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: JSON.stringify(tripData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || "Failed to create trip");
    }

    return data;
}
