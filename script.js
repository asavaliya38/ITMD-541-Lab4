// Function to fetch sunrise and sunset data based on location
async function fetchSunriseSunsetData(location) {
  const apiKey = "YOUR_API_KEY";
  const todayUrl = `https://api.sunrise-sunset.org/json?formatted=0&date=today&timezone=auto&location=${encodeURIComponent(
    location
  )}&apiKey=${apiKey}`;
  const tomorrowUrl = `https://api.sunrise-sunset.org/json?formatted=0&date=tomorrow&timezone=auto&location=${encodeURIComponent(
    location
  )}&apiKey=${apiKey}`;

  try {
    const [todayResponse, tomorrowResponse] = await Promise.all([
      fetch(todayUrl),
      fetch(tomorrowUrl),
    ]);

    if (!todayResponse.ok || !tomorrowResponse.ok) {
      throw new Error("Failed to fetch data");
    }

    const [todayData, tomorrowData] = await Promise.all([
      todayResponse.json(),
      tomorrowResponse.json(),
    ]);

    return { today: todayData.results, tomorrow: tomorrowData.results };
  } catch (error) {
    displayErrorMessage("Error fetching data");
    console.error("Error:", error);
    return null;
  }
}

// Function to update UI with fetched data
function updateUI(data) {
  document.getElementById("todayDate").innerText = formatDate(
    data.today.sunrise
  );
  document.getElementById("tomorrowDate").innerText = formatDate(
    data.tomorrow.sunrise
  );

  const todayInfo = document.getElementById("todayInfo");
  todayInfo.innerHTML = createInfoHTML(data.today);

  const tomorrowInfo = document.getElementById("tomorrowInfo");
  tomorrowInfo.innerHTML = createInfoHTML(data.tomorrow);
}

// Event listener for the Search button
document.getElementById("searchButton").addEventListener("click", async () => {
  const location = document.getElementById("locationInput").value;
  const data = await fetchSunriseSunsetData(location);
  if (data) {
    updateUI(data);
  }
});

// Function to format date
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC", // Ensure it's displayed in the right time zone
  };
  return date.toLocaleDateString("en-US", options);
}

// Function to create HTML content for sunrise and sunset information
function createInfoHTML(data) {
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: data.timezone, // Use the time zone provided in the data
    });
  };

  const dayLength = `${Math.floor(data.day_length / 3600)}h ${Math.floor(
    (data.day_length % 3600) / 60
  )}m`;
  const solarNoonTime = formatTime(data.solar_noon);

  const sunriseTime = formatTime(data.sunrise);
  const sunsetTime = formatTime(data.sunset);
  const dawnTime = formatTime(data.civil_twilight_begin);
  const duskTime = formatTime(data.civil_twilight_end);

  return `
    <div class="sunrise-sunset">
      <h4>Sunrise</h4>
      <img src="sr.svg" alt="Sunrise icon" />
      <div>
        <p class="time">${sunriseTime}</p>
        <p>Dawn: ${dawnTime}</p>
      </div>
    </div>
    <div class="sunrise-sunset">
      <h4>Sunset</h4>
      <img src="ss.svg" alt="Sunset icon" />
      <div>
        <p class="time">${sunsetTime}</p>
        <p>Dusk: ${duskTime}</p>
      </div>
    </div>
    <div class="day-info">
      <h4>Day Length</h4>
      <p>${dayLength}</p>
    </div>
    <div class="solar-noon-info">
      <h4>Solar Noon</h4>
      <p>${solarNoonTime}</p>
    </div>
    <div class="time-zone-info">
      <h4>Time Zone</h4>
      <p>${data.timezone}</p>
    </div>
  `;
}

// Function to display error messages
function displayErrorMessage(message) {
  const errorMessage = document.getElementById("errorMessage");
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");
}
