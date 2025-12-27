// Weather App JavaScript

class WeatherApp {
    constructor() {
        // Using free weather APIs that don't require API keys
        this.GEOCODING_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';
        this.WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';

        this.initializeElements();
        this.bindEvents();
        this.loadDefaultWeather();
    }

    initializeElements() {
        this.cityInput = document.getElementById('cityInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.locationBtn = document.getElementById('locationBtn');
        this.loading = document.getElementById('loading');
        this.weatherCard = document.getElementById('weatherCard');
        this.errorMessage = document.getElementById('errorMessage');
        this.retryBtn = document.getElementById('retryBtn');

        // Date selector elements
        this.dateButtons = document.querySelectorAll('.date-btn');
        this.selectedDays = 0; // Default to today

        // Forecast tab elements
        this.hourlyTab = document.getElementById('hourlyTab');
        this.dailyTab = document.getElementById('dailyTab');
        this.hourlyForecast = document.getElementById('hourlyForecast');
        this.dailyForecast = document.getElementById('dailyForecast');
        this.hourlyList = document.getElementById('hourlyList');

        // Weather display elements
        this.cityName = document.getElementById('cityName');
        this.currentDate = document.getElementById('currentDate');
        this.temperature = document.getElementById('temperature');
        this.weatherIcon = document.getElementById('weatherIcon');
        this.weatherDescription = document.getElementById('weatherDescription');
        this.visibility = document.getElementById('visibility');
        this.humidity = document.getElementById('humidity');
        this.windSpeed = document.getElementById('windSpeed');
        this.feelsLike = document.getElementById('feelsLike');
        this.pressure = document.getElementById('pressure');
        this.uvIndex = document.getElementById('uvIndex');
        this.forecastList = document.getElementById('forecastList');

        // Store current weather data for date switching
        this.currentWeatherData = null;
    }

    bindEvents() {
        this.searchBtn.addEventListener('click', () => this.searchWeather());
        this.cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWeather();
        });
        this.locationBtn.addEventListener('click', () => this.getCurrentLocation());
        this.retryBtn.addEventListener('click', () => this.loadDefaultWeather());

        // Date selector events
        this.dateButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const days = parseInt(e.target.dataset.days);
                this.selectDate(days);
            });
        });

        // Forecast tab events
        this.hourlyTab.addEventListener('click', () => this.showHourlyForecast());
        this.dailyTab.addEventListener('click', () => this.showDailyForecast());
    }

    showHourlyForecast() {
        this.hourlyTab.classList.add('active');
        this.dailyTab.classList.remove('active');
        this.hourlyForecast.style.display = 'block';
        this.dailyForecast.style.display = 'none';

        // Update hourly data if we have weather data
        if (this.currentWeatherData) {
            this.displayHourlyForecast(this.currentWeatherData, this.selectedDays);
        }
    }

    showDailyForecast() {
        this.dailyTab.classList.add('active');
        this.hourlyTab.classList.remove('active');
        this.dailyForecast.style.display = 'block';
        this.hourlyForecast.style.display = 'none';

        // Update daily data if we have weather data
        if (this.currentWeatherData) {
            this.displayForecastFromData(this.currentWeatherData);
        }
    }

    selectDate(days) {
        this.selectedDays = days;

        // Update active button
        this.dateButtons.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.days) === days) {
                btn.classList.add('active');
            }
        });

        // Update weather display if we have data
        if (this.currentWeatherData) {
            this.displayWeatherForDate(this.currentWeatherData, days);

            // Also update hourly forecast if hourly tab is active
            if (this.hourlyTab.classList.contains('active')) {
                this.displayHourlyForecast(this.currentWeatherData, days);
            }
        }
    }

    async loadDefaultWeather() {
        // Try to get user's location first, fallback to Kolkata if not available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    await this.getWeatherByCoords(latitude, longitude);
                },
                async (error) => {
                    // If location access is denied or fails, fallback to Kolkata
                    console.log('Location access denied or failed, using Kolkata as default');
                    await this.getWeatherByCity('Kolkata');
                }
            );
        } else {
            // If geolocation is not supported, fallback to Kolkata
            await this.getWeatherByCity('Kolkata');
        }
    }

    async searchWeather() {
        const city = this.cityInput.value.trim();
        if (!city) {
            this.showError('Please enter a city name');
            return;
        }
        await this.getWeatherByCity(city);
    }

    async getCurrentLocation() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser');
            return;
        }

        this.showLoading();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                await this.getWeatherByCoords(latitude, longitude);
            },
            (error) => {
                this.showError('Unable to get your location. Please try searching for a city.');
            }
        );
    }

    transformOpenMeteoData(data, cityName, country) {
        const current = data.current;
        const daily = data.daily;

        // Weather code mapping for Open-Meteo
        const weatherCodeMap = {
            0: { main: 'Clear', description: 'clear sky' },
            1: { main: 'Clear', description: 'mainly clear' },
            2: { main: 'Clouds', description: 'partly cloudy' },
            3: { main: 'Clouds', description: 'overcast' },
            45: { main: 'Fog', description: 'fog' },
            48: { main: 'Fog', description: 'depositing rime fog' },
            51: { main: 'Drizzle', description: 'light drizzle' },
            53: { main: 'Drizzle', description: 'moderate drizzle' },
            55: { main: 'Drizzle', description: 'dense drizzle' },
            61: { main: 'Rain', description: 'slight rain' },
            63: { main: 'Rain', description: 'moderate rain' },
            65: { main: 'Rain', description: 'heavy rain' },
            71: { main: 'Snow', description: 'slight snow' },
            73: { main: 'Snow', description: 'moderate snow' },
            75: { main: 'Snow', description: 'heavy snow' },
            95: { main: 'Thunderstorm', description: 'thunderstorm' },
            96: { main: 'Thunderstorm', description: 'thunderstorm with hail' },
            99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail' }
        };

        const currentWeather = weatherCodeMap[current.weather_code] || { main: 'Clear', description: 'clear sky' };

        return {
            current: {
                name: cityName,
                sys: { country: country },
                main: {
                    temp: Math.round(current.temperature_2m),
                    feels_like: Math.round(current.apparent_temperature),
                    humidity: current.relative_humidity_2m,
                    pressure: Math.round(current.surface_pressure)
                },
                weather: [currentWeather],
                visibility: 10000, // Default value as Open-Meteo doesn't provide this
                wind: {
                    speed: current.wind_speed_10m / 3.6, // Convert km/h to m/s
                    deg: current.wind_direction_10m
                }
            },
            forecast: {
                list: daily.time.slice(1, 6).map((date, index) => ({
                    dt: new Date(date).getTime() / 1000,
                    main: {
                        temp: Math.round((daily.temperature_2m_max[index + 1] + daily.temperature_2m_min[index + 1]) / 2)
                    },
                    weather: [weatherCodeMap[daily.weather_code[index + 1]] || { main: 'Clear', description: 'clear sky' }]
                }))
            }
        };
    }

    async getWeatherByCity(city) {
        this.showLoading();

        try {
            // First, get coordinates for the city using a geocoding service
            const geoResponse = await fetch(
                `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
            );

            if (!geoResponse.ok) {
                throw new Error('Failed to find city');
            }

            const geoData = await geoResponse.json();

            if (!geoData.results || geoData.results.length === 0) {
                throw new Error('City not found');
            }

            const location = geoData.results[0];
            const { latitude, longitude, name, country } = location;

            // Get weather data using coordinates
            await this.getWeatherByCoords(latitude, longitude, name, country);

        } catch (error) {
            this.showError('City not found. Please check the spelling and try again.');
        }
    }

    async getWeatherByCoords(lat, lon, cityName = null, country = null) {
        try {
            // Get location name if not provided
            if (!cityName) {
                const geoResponse = await fetch(
                    `${this.GEOCODING_URL}?latitude=${lat}&longitude=${lon}&localityLanguage=en`
                );
                const geoData = await geoResponse.json();
                cityName = geoData.city || geoData.locality || 'Your Location';
                country = geoData.countryCode || '';
            }

            // Get weather data from Open-Meteo (free API) - extended to 14 days with hourly data
            const weatherResponse = await fetch(
                `${this.WEATHER_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,relative_humidity_2m_mean,wind_speed_10m_max&timezone=auto&forecast_days=14`
            );

            if (!weatherResponse.ok) {
                throw new Error('Failed to fetch weather data');
            }

            const weatherData = await weatherResponse.json();

            // Store the raw weather data for date switching
            this.currentWeatherData = weatherData;
            this.currentLocationName = cityName;
            this.currentCountry = country;

            // Display weather for the currently selected date
            this.displayWeatherForDate(weatherData, this.selectedDays);

        } catch (error) {
            this.showError('Unable to fetch weather data for your location.');
        }
    }

    displayWeatherForDate(weatherData, dayOffset) {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + dayOffset);

        // Weather code mapping for Open-Meteo
        const weatherCodeMap = {
            0: { main: 'Clear', description: 'clear sky' },
            1: { main: 'Clear', description: 'mainly clear' },
            2: { main: 'Clouds', description: 'partly cloudy' },
            3: { main: 'Clouds', description: 'overcast' },
            45: { main: 'Fog', description: 'fog' },
            48: { main: 'Fog', description: 'depositing rime fog' },
            51: { main: 'Drizzle', description: 'light drizzle' },
            53: { main: 'Drizzle', description: 'moderate drizzle' },
            55: { main: 'Drizzle', description: 'dense drizzle' },
            61: { main: 'Rain', description: 'slight rain' },
            63: { main: 'Rain', description: 'moderate rain' },
            65: { main: 'Rain', description: 'heavy rain' },
            71: { main: 'Snow', description: 'slight snow' },
            73: { main: 'Snow', description: 'moderate snow' },
            75: { main: 'Snow', description: 'heavy snow' },
            95: { main: 'Thunderstorm', description: 'thunderstorm' },
            96: { main: 'Thunderstorm', description: 'thunderstorm with hail' },
            99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail' }
        };

        let displayData;

        if (dayOffset === 0) {
            // Today - use current data
            const current = weatherData.current;
            const currentWeather = weatherCodeMap[current.weather_code] || { main: 'Clear', description: 'clear sky' };

            displayData = {
                temp: Math.round(current.temperature_2m),
                feels_like: Math.round(current.apparent_temperature),
                humidity: current.relative_humidity_2m,
                pressure: Math.round(current.surface_pressure),
                wind_speed: current.wind_speed_10m,
                weather: currentWeather
            };
        } else {
            // Future date - use daily forecast data
            const dailyIndex = dayOffset;
            if (dailyIndex < weatherData.daily.time.length) {
                const dailyWeather = weatherCodeMap[weatherData.daily.weather_code[dailyIndex]] || { main: 'Clear', description: 'clear sky' };

                displayData = {
                    temp: Math.round((weatherData.daily.temperature_2m_max[dailyIndex] + weatherData.daily.temperature_2m_min[dailyIndex]) / 2),
                    feels_like: Math.round((weatherData.daily.temperature_2m_max[dailyIndex] + weatherData.daily.temperature_2m_min[dailyIndex]) / 2),
                    humidity: Math.round(weatherData.daily.relative_humidity_2m_mean[dailyIndex]),
                    pressure: Math.round(weatherData.current.surface_pressure), // Use current pressure as daily pressure not available
                    wind_speed: weatherData.daily.wind_speed_10m_max[dailyIndex],
                    weather: dailyWeather
                };
            } else {
                this.showError('Weather data not available for selected date');
                return;
            }
        }

        // Update display
        this.cityName.textContent = `${this.currentLocationName}, ${this.currentCountry}`;
        this.currentDate.textContent = this.formatDateWithOffset(dayOffset);
        this.temperature.textContent = `${displayData.temp}°C`;
        this.weatherDescription.textContent = this.capitalizeWords(displayData.weather.description);

        // Update weather icon
        this.updateWeatherIcon(displayData.weather.main);

        // Update weather details
        this.visibility.textContent = '10.0 km'; // Default value
        this.humidity.textContent = `${displayData.humidity}%`;
        this.windSpeed.textContent = `${(displayData.wind_speed * 3.6).toFixed(1)} km/h`;
        this.feelsLike.textContent = `${displayData.feels_like}°C`;
        this.pressure.textContent = `${displayData.pressure} hPa`;
        this.uvIndex.textContent = 'N/A';

        // Update forecast based on active tab
        if (this.hourlyTab.classList.contains('active')) {
            this.displayHourlyForecast(weatherData, dayOffset);
        } else {
            this.displayForecastFromData(weatherData);
        }

        // Clear input and show weather card
        this.cityInput.value = '';
        this.showWeatherCard();
    }

    displayHourlyForecast(weatherData, dayOffset) {
        const weatherCodeMap = {
            0: { main: 'Clear', description: 'clear sky' },
            1: { main: 'Clear', description: 'mainly clear' },
            2: { main: 'Clouds', description: 'partly cloudy' },
            3: { main: 'Clouds', description: 'overcast' },
            45: { main: 'Fog', description: 'fog' },
            48: { main: 'Fog', description: 'depositing rime fog' },
            51: { main: 'Drizzle', description: 'light drizzle' },
            53: { main: 'Drizzle', description: 'moderate drizzle' },
            55: { main: 'Drizzle', description: 'dense drizzle' },
            61: { main: 'Rain', description: 'slight rain' },
            63: { main: 'Rain', description: 'moderate rain' },
            65: { main: 'Rain', description: 'heavy rain' },
            71: { main: 'Snow', description: 'slight snow' },
            73: { main: 'Snow', description: 'moderate snow' },
            75: { main: 'Snow', description: 'heavy snow' },
            95: { main: 'Thunderstorm', description: 'thunderstorm' },
            96: { main: 'Thunderstorm', description: 'thunderstorm with hail' },
            99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail' }
        };

        this.hourlyList.innerHTML = '';

        // Calculate the start index for the selected day
        const now = new Date();
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + dayOffset);

        // Find the starting hour index for the selected day
        let startIndex = 0;
        if (dayOffset === 0) {
            // For today, start from current hour
            startIndex = now.getHours();
        } else {
            // For future days, start from the beginning of that day
            startIndex = dayOffset * 24;
        }

        // Show 24 hours starting from the calculated index
        for (let i = 0; i < 24; i++) {
            const hourIndex = startIndex + i;

            if (hourIndex < weatherData.hourly.time.length) {
                const hourTime = new Date(weatherData.hourly.time[hourIndex]);
                const weather = weatherCodeMap[weatherData.hourly.weather_code[hourIndex]] || { main: 'Clear', description: 'clear sky' };
                const temp = Math.round(weatherData.hourly.temperature_2m[hourIndex]);

                const hourlyItem = document.createElement('div');
                hourlyItem.className = 'hourly-item';

                // Format time
                const timeString = hourTime.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    hour12: true
                });

                hourlyItem.innerHTML = `
                    <div class="time">${timeString}</div>
                    <i class="${this.getWeatherIconClass(weather.main)}"></i>
                    <div class="temp">${temp}°C</div>
                    <div class="desc">${weather.description}</div>
                `;

                this.hourlyList.appendChild(hourlyItem);
            }
        }
    }

    displayWeather(currentData, forecastData) {
        // Legacy method for compatibility - redirect to new method
        this.displayWeatherForDate(this.currentWeatherData, 0);
    }

    displayForecast(forecastData) {
        const dailyForecasts = this.processForecastData(forecastData.list);
        
        this.forecastList.innerHTML = '';
        
        dailyForecasts.slice(0, 5).forEach(forecast => {
            const forecastItem = document.createElement('div');
            forecastItem.className = 'forecast-item';
            
            forecastItem.innerHTML = `
                <div class="day">${forecast.day}</div>
                <i class="${this.getWeatherIconClass(forecast.weather)}"></i>
                <div class="temp">${forecast.temp}°C</div>
            `;
            
            this.forecastList.appendChild(forecastItem);
        });
    }

    processForecastData(forecastList) {
        const dailyData = {};
        
        forecastList.forEach(item => {
            const date = new Date(item.dt * 1000);
            const day = date.toLocaleDateString('en-US', { weekday: 'short' });
            
            if (!dailyData[day]) {
                dailyData[day] = {
                    day,
                    temps: [],
                    weather: item.weather[0].main
                };
            }
            
            dailyData[day].temps.push(item.main.temp);
        });
        
        return Object.values(dailyData).map(day => ({
            ...day,
            temp: Math.round(day.temps.reduce((a, b) => a + b) / day.temps.length)
        }));
    }

    updateWeatherIcon(weatherMain) {
        const iconClass = this.getWeatherIconClass(weatherMain);
        this.weatherIcon.className = iconClass;
    }

    getWeatherIconClass(weatherMain) {
        const iconMap = {
            'Clear': 'fas fa-sun',
            'Clouds': 'fas fa-cloud',
            'Rain': 'fas fa-cloud-rain',
            'Drizzle': 'fas fa-cloud-drizzle',
            'Thunderstorm': 'fas fa-bolt',
            'Snow': 'fas fa-snowflake',
            'Mist': 'fas fa-smog',
            'Fog': 'fas fa-smog',
            'Haze': 'fas fa-smog'
        };
        
        return iconMap[weatherMain] || 'fas fa-cloud';
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatDateWithOffset(dayOffset) {
        const date = new Date();
        date.setDate(date.getDate() + dayOffset);

        if (dayOffset === 0) {
            return 'Today, ' + this.formatDate(date);
        } else if (dayOffset === 1) {
            return 'Tomorrow, ' + this.formatDate(date);
        } else {
            return this.formatDate(date);
        }
    }

    displayForecastFromData(weatherData) {
        const weatherCodeMap = {
            0: { main: 'Clear', description: 'clear sky' },
            1: { main: 'Clear', description: 'mainly clear' },
            2: { main: 'Clouds', description: 'partly cloudy' },
            3: { main: 'Clouds', description: 'overcast' },
            45: { main: 'Fog', description: 'fog' },
            48: { main: 'Fog', description: 'depositing rime fog' },
            51: { main: 'Drizzle', description: 'light drizzle' },
            53: { main: 'Drizzle', description: 'moderate drizzle' },
            55: { main: 'Drizzle', description: 'dense drizzle' },
            61: { main: 'Rain', description: 'slight rain' },
            63: { main: 'Rain', description: 'moderate rain' },
            65: { main: 'Rain', description: 'heavy rain' },
            71: { main: 'Snow', description: 'slight snow' },
            73: { main: 'Snow', description: 'moderate snow' },
            75: { main: 'Snow', description: 'heavy snow' },
            95: { main: 'Thunderstorm', description: 'thunderstorm' },
            96: { main: 'Thunderstorm', description: 'thunderstorm with hail' },
            99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail' }
        };

        this.forecastList.innerHTML = '';

        // Show next 5 days starting from tomorrow
        for (let i = 1; i <= 5; i++) {
            if (i < weatherData.daily.time.length) {
                const date = new Date(weatherData.daily.time[i]);
                const weather = weatherCodeMap[weatherData.daily.weather_code[i]] || { main: 'Clear', description: 'clear sky' };
                const avgTemp = Math.round((weatherData.daily.temperature_2m_max[i] + weatherData.daily.temperature_2m_min[i]) / 2);

                const forecastItem = document.createElement('div');
                forecastItem.className = 'forecast-item';

                forecastItem.innerHTML = `
                    <div class="day">${date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <i class="${this.getWeatherIconClass(weather.main)}"></i>
                    <div class="temp">${avgTemp}°C</div>
                `;

                this.forecastList.appendChild(forecastItem);
            }
        }
    }

    capitalizeWords(str) {
        return str.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }

    showLoading() {
        this.loading.style.display = 'block';
        this.weatherCard.style.display = 'none';
        this.errorMessage.style.display = 'none';
    }

    showWeatherCard() {
        this.loading.style.display = 'none';
        this.weatherCard.style.display = 'block';
        this.errorMessage.style.display = 'none';
    }

    showError(message) {
        this.loading.style.display = 'none';
        this.weatherCard.style.display = 'none';
        this.errorMessage.style.display = 'block';
        document.getElementById('errorText').textContent = message;
    }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});
