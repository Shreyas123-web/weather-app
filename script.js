// No API Key needed for Open-Meteo!

function getWeather() {
    const city = document.getElementById("cityInput").value;
    const resultDiv = document.getElementById("weatherResult");

    if (!city) {
        resultDiv.innerHTML = "Please enter a city name.";
        return;
    }

    resultDiv.innerHTML = "Loading...";

    // STEP 1: Get the coordinates (Lat/Lon) for the city name
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;

    fetch(geoUrl)
        .then(response => response.json())
        .then(geoData => {
            // Check if the city was found
            if (!geoData.results || geoData.results.length === 0) {
                throw new Error("City not found");
            }

            const location = geoData.results[0];
            const lat = location.latitude;
            const lon = location.longitude;
            const cityName = location.name;
            const country = location.country_code;

            // STEP 2: Fetch weather using those coordinates
            // We ask for: Temp, Humidity, Weather Code, and Wind Speed
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`;

            return fetch(weatherUrl)
                .then(res => res.json())
                .then(weatherData => {
                    return { weatherData, cityName, country };
                });
        })
        .then(({ weatherData, cityName, country }) => {
            const current = weatherData.current;

            // Helper to convert numeric code to text (Open-Meteo uses codes like 0, 1, 2)
            const weatherDescription = getWeatherDescription(current.weather_code);

            resultDiv.innerHTML = `
                <h2>${cityName}, ${country}</h2>
                <p>🌡 Temperature: ${current.temperature_2m}°C</p>
                <p>☁ Weather: ${weatherDescription}</p>
                <p>💧 Humidity: ${current.relative_humidity_2m}%</p>
                <p>🌬 Wind Speed: ${current.wind_speed_10m} km/h</p>
            `;
        })
        .catch(error => {
            console.error(error);
            if (error.message === "City not found") {
                resultDiv.innerHTML = "City not found. Please try again.";
            } else {
                resultDiv.innerHTML = "Error fetching weather data.";
            }
        });
}

// Open-Meteo uses numbers for weather. This function gives them names.
function getWeatherDescription(code) {
    const codes = {
        0: "Clear sky",
        1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
        45: "Fog", 48: "Depositing rime fog",
        51: "Light Drizzle", 53: "Moderate Drizzle", 55: "Dense Drizzle",
        61: "Slight Rain", 63: "Moderate Rain", 65: "Heavy Rain",
        71: "Slight Snow", 73: "Moderate Snow", 75: "Heavy Snow",
        95: "Thunderstorm", 96: "Thunderstorm with hail"
    };
    return codes[code] || "Unknown Weather";
}
