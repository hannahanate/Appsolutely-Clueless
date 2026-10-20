//const LOCAL_API_URL =
    "https://appsolutelyclueless-afhnauf5cqc4bvek.francecentral-01.azurewebsites.net/api/trips";

//Hannan lisäys - poista kommentti ennen palautusta
//Eli kun haluut testata paikallista backendia, vaihda API_URL:ksi LOCAL_API_URL.
//Azure tehdään erikseen jotenkin, aivot jumissa taas ei jaksa :D
const AZURE_API_URL =
  "https://appsolutelyclueless-afhnauf5cqc4bvek.francecentral-01.azurewebsites.net/api";
const LOCAL_API_URL = "http://192.168.0.202:3000/api";

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
