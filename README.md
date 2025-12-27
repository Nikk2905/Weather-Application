# Weather Report Website

A modern, responsive weather application built with HTML, CSS, and JavaScript that provides current weather conditions and 5-day forecasts.

## Features

- **Current Weather Display**: Shows temperature, weather conditions, humidity, wind speed, pressure, and more
- **5-Day Forecast**: Displays upcoming weather predictions
- **Location Services**: Get weather for your current location
- **City Search**: Search for weather in any city worldwide
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Beautiful UI**: Modern gradient design with smooth animations
- **Demo Mode**: Works without API key for demonstration purposes

## Setup Instructions

### Option 1: Demo Mode (No API Key Required)
1. Simply open `index.html` in your web browser
2. The app will run in demo mode with sample weather data
3. You can search for cities and use location services (demo data will be shown)

### Option 2: Live Weather Data (API Key Required)
1. Get a free API key from [OpenWeatherMap](https://openweathermap.org/api)
   - Sign up for a free account
   - Go to API keys section
   - Generate a new API key

2. Open `script.js` file
3. Replace `YOUR_API_KEY_HERE` with your actual API key:
   ```javascript
   this.API_KEY = 'your_actual_api_key_here';
   ```

4. Open `index.html` in your web browser

## File Structure

```
weather-app/
├── index.html          # Main HTML file
├── style.css           # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## How to Use

1. **Search by City**: 
   - Type a city name in the search box
   - Click the search button or press Enter

2. **Use Current Location**:
   - Click the "Use My Location" button
   - Allow location access when prompted

3. **View Weather Details**:
   - Current temperature and conditions
   - Detailed weather metrics (humidity, wind, pressure, etc.)
   - 5-day weather forecast

## Technologies Used

- **HTML5**: Semantic markup and structure
- **CSS3**: Modern styling with flexbox, grid, and animations
- **JavaScript ES6+**: Async/await, classes, and modern JavaScript features
- **Font Awesome**: Weather and UI icons
- **OpenWeatherMap API**: Real weather data (when API key is provided)

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## API Information

This app uses the OpenWeatherMap API for weather data:
- **Current Weather API**: `/weather` endpoint
- **5-Day Forecast API**: `/forecast` endpoint
- **Geolocation Support**: Coordinates-based weather lookup

## Customization

You can easily customize the app by:

1. **Changing Colors**: Modify the CSS gradient and color variables in `style.css`
2. **Adding Features**: Extend the JavaScript classes in `script.js`
3. **Modifying Layout**: Update the HTML structure and corresponding CSS

## Demo Cities

In demo mode, you can try searching for:
- London (has demo data)
- Any other city (will show London's demo data)

## Troubleshooting

**Weather data not loading?**
- Check if you have a valid API key set in `script.js`
- Ensure you have an internet connection
- Check browser console for error messages

**Location not working?**
- Make sure you allow location access when prompted
- Check if your browser supports geolocation
- Try using HTTPS instead of HTTP

**Styling issues?**
- Ensure all files are in the same directory
- Check if Font Awesome CDN is accessible
- Clear browser cache and refresh

## License

This project is open source and available under the MIT License.

## Credits

- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons by [Font Awesome](https://fontawesome.com/)
- Built with modern web technologies
