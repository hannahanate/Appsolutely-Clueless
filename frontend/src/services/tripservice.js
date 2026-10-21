//const LOCAL_API_URL =
    "https://appsolutelyclueless-afhnauf5cqc4bvek.francecentral-01.azurewebsites.net/api/trips";

const AZURE_API_URL =
  "https://appsolutelyclueless-afhnauf5cqc4bvek.francecentral-01.azurewebsites.net/api";
//HANNAN 
  const LOCAL_API_URL = "http://192.168.0.202:3000/api";
//NIINAN
//const LOCAL_API_URL = "http://192.168.50.25:3000/api";


// Change this to LOCAL_API_URL when you want to use the local backend.
export const API_URL = LOCAL_API_URL;

// Add /trips to the shared URL for trip requests.
const TRIPS_URL = `${API_URL}/trips`;

export async function getTrips() {
  const response = await fetch(TRIPS_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch trips: ${response.status}`);
  }

  return response.json();
    }


    // Luo uusi matka - create new trip
    export async function createTrip(tripData) {
    const response = await fetch(TRIPS_URL, {
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


//Get one trip by id

export async function getTrip(id) {
  const response = await fetch(`${TRIPS_URL}/${id}`);

  if (!response.ok) {
    throw new Error("Failed to load trip details");
  }

  return response.json();
}

//update an existing trip
export async function updateTrip(id, tripData) {
  const response = await fetch(`${TRIPS_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(tripData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update trip");
  }

  return data;
}

//Delete a trip
export async function deleteTrip(id) {
  const response = await fetch(`${TRIPS_URL}/${id}`, {
    method: "DELETE",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete trip");
  }

  return data;
}


 //get all expenses for a trip
export async function getBudget(tripId) {
    const response = await fetch(
        `${API_URL}/trips/${tripId}/budget`
    );

    if (!response.ok) {
        throw new Error("Failed to load budget");
    }

    return response.json();
}

//Add a new expense
export async function addBudgetExpense(tripId, expense) {
    const response = await fetch(
        `${API_URL}/trips/${tripId}/budget`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(expense),
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add expense");
    }

    return response.json();
}

//Delete an expense
export async function deleteBudgetExpense(id) {
    const response = await fetch(
        `${API_URL}/budget/${id}`,
        {
            method: "DELETE",
        }
    );

    if (!response.ok) {
        throw new Error("Failed to delete expense");
    }

    return response.json();
}

//get the total budget for a trip
export async function getTripBudget(tripId) {
    const response = await fetch(
        `${API_URL}/trips/${tripId}/total-budget`
    );

    if (!response.ok) {
        throw new Error("Failed to load total budget");
    }

    return response.json();
}

//save the total budget for a trip
export async function saveTripBudget(tripId, totalBudget) {
    const response = await fetch(
        `${API_URL}/trips/${tripId}/total-budget`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ totalBudget })
        }
    );

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save total budget");
    }

    return response.json();
}
