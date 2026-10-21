# Appsolutely-Clueless

Azure webservice: https://appsolutelyclueless-afhnauf5cqc4bvek.francecentral-01.azurewebsites.net/api/trips



## Setting up the Travel Planner project ##

# Install and start the backend #

Open a terminal in the backend folder:

npm install
npm run dev

The backend should start on port 3000. The SQLite database and tables are created automatically by the database setup code.

Test the backend by opening:

http://localhost:3000/api/trips

# Install and start the frontend #
 
Open a second terminal in the frontend project folder:

npm install
npx expo start --tunnel

Open the app using Expo Go or simulator you use.

# Connect the frontend to the local backend #

The frontend must use the local backend URL when testing local SQLite changes.

For a physical phone, use the computer's local network IP address instead of localhost, and if using expo go make sure the phone and computer are on the same Wi-Fi network.

For example:

const API_URL = "http://192....3000/api/trips";

Replace the example IP with your own computer's IP address.

Each developer has their own local SQLite database, so data created on one computer will not automatically appear on another.


# Additional frontend packages used # 

npx expo install @react-native-picker/picker

npm install country-state-city

npm install react-native-dropdown-picker
