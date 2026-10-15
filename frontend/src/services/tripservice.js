//const LOCAL_API_URL =
    "https://appsolutelyclueless-afhnauf5cqc4bvek.francecentral-01.azurewebsites.net/api/trips";

//Hannan lisäys - poista kommentti ennen palautusta
//Eli kun haluut testata paikallista backendia, vaihda API_URL:ksi LOCAL_API_URL.
//Azure tehdään erikseen jotenkin, aivot jumissa taas ei jaksa :D
const AZURE_API_URL =
  "https://appsolutelyclueless-afhnauf5cqc4bvek.francecentral-01.azurewebsites.net/api/trips";
const LOCAL_API_URL = "http://192.168.0.202:3000/api/trips";

// Change this to LOCAL_API_URL when you want to use the local backend.
const API_URL = AZURE_API_URL;

export async function getTrips() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch trips: ${response.status}`);
  }

  return response.json();
    }


//En uskaltanu poistaa tätä kun tätä ei ollu viimeks kun tein niin en tiiä vaikuttaako miten tohon mun
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
