// Weather & Quotes Dashboard

// APIs and data
const weatherAPI = 'https://api.open-meteo.com/v1/forecast';
const geoAPI = 'https://geocoding-api.open-meteo.com/v1/search';

const weatherCodes = {
    0: { description: "Clear", emoji: "☀️" },
    1: { description: "Mostly Clear", emoji: "🌤️" },
    2: { description: "Partly Cloudy", emoji: "⛅" },
    3: { description: "Cloudy", emoji: "☁️" },
    45: { description: "Foggy", emoji: "🌫️" },
    61: { description: "Rainy", emoji: "🌧️" },
    71: { description: "Snowy", emoji: "❄️" },
    95: { description: "Stormy", emoji: "⛈️" }
};

const quotes = [
    { q: "The only way to do great work is to love what you do.", a: "Steve Jobs" },
    { q: "Innovation distinguishes between a leader and a follower.", a: "Steve Jobs" },
    { q: "Life is what happens to you while you're busy making other plans.", a: "John Lennon" },
    { q: "The future belongs to those who believe in the beauty of their dreams.", a: "Eleanor Roosevelt" },
    { q: "The way to get started is to quit talking and begin doing.", a: "Walt Disney" },
    { q: "Success is not final, failure is not fatal: it is the courage to continue that counts.", a: "Winston Churchill" },
    { q: "Don't let yesterday take up too much of today.", a: "Will Rogers" },
    { q: "You learn more from failure than from success.", a: "Unknown" }
];

let quoteIndex = 0;
let city = { name: "London", latitude: 51.5074, longitude: -0.1278 };

// Start app when page loads
document.addEventListener('DOMContentLoaded', function() {
    getWeather();
    showQuote();
    
    // Search form
    document.getElementById('search-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        const cityName = document.getElementById('city-input').value.trim();
        if (!cityName) {
            alert('Please enter a city name');
            return;
        }
        
        document.getElementById('weather').innerHTML = '<div class="loading">Searching...</div>';
        
        try {
            const response = await fetch(`${geoAPI}?name=${cityName}&count=1`);
            const data = await response.json();
            
            if (data.results && data.results[0]) {
                city = {
                    name: data.results[0].name,
                    latitude: data.results[0].latitude,
                    longitude: data.results[0].longitude
                };
                getWeather();
                document.getElementById('city-input').value = '';
            } else {
                document.getElementById('weather').innerHTML = '<div class="error">City not found!</div>';
            }
        } catch (error) {
            document.getElementById('weather').innerHTML = '<div class="error">Search failed!</div>';
        }
    });
    
    // New quote button
    document.getElementById('new-quote').addEventListener('click', function() {
        quoteIndex = (quoteIndex + 1) % quotes.length;
        document.getElementById('quote').innerHTML = '<div class="loading">Getting new quote...</div>';
        setTimeout(showQuote, 300);
    });
});

// Get weather data
async function getWeather() {
    document.getElementById('weather').innerHTML = '<div class="loading">Loading weather...</div>';
    
    try {
        const url = `${weatherAPI}?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=4`;
        const response = await fetch(url);
        const data = await response.json();
        
        const current = data.current;
        const daily = data.daily;
        const weatherInfo = weatherCodes[current.weather_code] || weatherCodes[0];
        
        let forecastHTML = '';
        for (let i = 1; i < 4; i++) {
            const dayWeather = weatherCodes[daily.weather_code[i]] || weatherCodes[0];
            const date = new Date(daily.time[i]);
            const dayName = date.toLocaleDateString('en', { weekday: 'short' });
            
            forecastHTML += `
                <div class="forecast-day">
                    <div class="day-name">${dayName}</div>
                    <div class="day-icon">${dayWeather.emoji}</div>
                    <div class="day-temps">${Math.round(daily.temperature_2m_max[i])}°/${Math.round(daily.temperature_2m_min[i])}°</div>
                </div>
            `;
        }
        
        document.getElementById('weather').innerHTML = `
            <div class="current-weather">
                <div class="city-name">${city.name}</div>
                <div class="temperature">${Math.round(current.temperature_2m)}°C</div>
                <div class="condition">${weatherInfo.emoji} ${weatherInfo.description}</div>
            </div>
            
            <div class="weather-details">
                <div class="detail">
                    <span class="detail-label">Humidity</span>
                    <span class="detail-value">${current.relative_humidity_2m}%</span>
                </div>
                <div class="detail">
                    <span class="detail-label">Wind</span>
                    <span class="detail-value">${Math.round(current.wind_speed_10m)} km/h</span>
                </div>
            </div>
            
            <div class="forecast">
                <h3>3-Day Forecast</h3>
                <div class="forecast-days">${forecastHTML}</div>
            </div>
        `;
        
    } catch (error) {
        document.getElementById('weather').innerHTML = '<div class="error">Weather loading failed!</div>';
    }
}

// Show quote
function showQuote() {
    const quote = quotes[quoteIndex];
    document.getElementById('quote').innerHTML = `
        <div class="quote-text">"${quote.q}"</div>
        <div class="quote-author">— ${quote.a}</div>
    `;
}
