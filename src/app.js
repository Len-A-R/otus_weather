import './styles.css';
import { CityHistoryManager } from './city_history.js';
import { WeatherUI } from './weather_ui.js';
import { WeatherService } from './weather_service.js';
import { ErrorDialog } from './error_dlg.js';

const CONFIG = {
  WEATHER_API_KEY: 'ce2efde41862706bd2d4973c702caa1b',
  YANDEX_MAP_API_KEY: '578cfe4c-8ea6-4ace-a418-31752d498590',
  MAX_HISTORY_ITEMS: 10,
};
const cityEditor = document.getElementById('city-editor');
const cityHistoryList = document.querySelector('.city-history');
const enterBtn = document.getElementById('enter-btn');

const historyManager = new CityHistoryManager(
  CONFIG,
  cityEditor,
  cityHistoryList,
  enterBtn,
);
const weatherSrv = new WeatherService(CONFIG.WEATHER_API_KEY);

function handleError(error) {
  // Определяем текст сообщения об ошибке
  let errorMessage = 'Произошла неизвестная ошибка';

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }

  // Показываем диалог с ошибкой
  ErrorDialog.show(errorMessage);
}

/**
 * Получение информации о погоде и отображение на странице
 * @param {string} city - Название города
 * @returns {Promise<void>}
 */
async function getWeather(city) {
  try {
    const { lat, lon } = await weatherSrv.getCoordinates(city);
    const weather = await weatherSrv.getWeatherInfo(lat, lon);

    WeatherUI.updateWeatherDisplay(weather);
    WeatherUI.updateMap(CONFIG, lon, lat);
    historyManager.save(city);
    historyManager.display();
  } catch (error) {
    handleError(error);
  }
}

// Обработчик события нажатия на кнопку "Ввод"
enterBtn.addEventListener('click', () => {
  const city = cityEditor.value;
  if (!city) {
    handleError(new Error('Необходимо ввести название города'));
    return;
  }
  getWeather(city);
});

// Обработчик события нажатия на Enter в поле ввода города
cityEditor.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    enterBtn.click();
  }
});

// Загружаем историю при загрузке страницы
function handleAfterLoadPage() {
  // Инициализация диалога ошибок
  ErrorDialog.init();
  // Загрузка истории городов
  historyManager.display();
}
document.addEventListener('DOMContentLoaded', handleAfterLoadPage);

// Текущий город
function getCurrentLocation() {
  return fetch('https://get.geojs.io/v1/ip/geo.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Ошибка при получении данных о местоположении: ${response.status}`,
        );
      }
      return response.json();
    })
    .then((data) => {
      if (!data || !data.city) {
        throw new Error('Не удалось получить местоположение');
      }
      return data.city;
    });
}

// получаем погоду для текущего местоположения
getCurrentLocation().then((city) => {
  if (city) {
    cityEditor.value = city;
    getWeather(city);
  }
});
