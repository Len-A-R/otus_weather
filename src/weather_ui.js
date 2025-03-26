import { ErrorDialog } from './error_dlg.js';

export const WeatherUI = {
  // обновление информации о погоде на странице
  updateWeatherDisplay({ iconUrl, description, temp }) {
    const weatherIcon = document.querySelector('.weather-icon');
    const weatherDescription = document.querySelector('.weather-description');
    const weatherTemp = document.querySelector('.weather-temp');
    weatherIcon.src = iconUrl;
    weatherIcon.alt = description;
    weatherDescription.textContent = description;
    weatherTemp.textContent = `${temp} °C`;
  },
  // обновление карты на странице
  updateMap(config, lon, lat) {
    const mapContainer = document.getElementById('map-container');
    const mapUrl = `https://static-maps.yandex.ru/v1?ll=${lon},${lat}&lang=ru_RU&size=650,450&z=10&apikey=${config.YANDEX_MAP_API_KEY}`;
    mapContainer.style.backgroundImage = `url(${mapUrl})`;
    mapContainer.style.backgroundSize = 'cover';
    mapContainer.style.backgroundRepeat = 'no-repeat';
    mapContainer.style.backgroundPosition = 'center';
  },
  // отображение сообщения об ошибке
  showError(message) {
    ErrorDialog.show(message);
  },
};
