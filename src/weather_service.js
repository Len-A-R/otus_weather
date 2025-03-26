/**
 * Сервис для работы с OpenWeather API
 */
export class WeatherService {
  static get BASE_URL() {
    return 'https://api.openweathermap.org/data/2.5/';
  }

  /**
   * @param {string} apiKey - API ключ OpenWeather
   * @throws {Error} Если API ключ не предоставлен
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API ключ обязателен');
    }
    this.apiKey = apiKey;
  }

  /**
   * Обработка ошибок API
   * @private
   */
  handleApiError(status) {
    this.errors = {
      401: 'Неверный ключ API',
      404: 'Город не найден',
      default: 'Не удалось получить данные о погоде',
    };
    throw new Error(this.errors[status] || this.errors.default);
  }

  /**
   * Получение координат города
   * @param {string} city - Название города
   * @returns {Promise<{lat: number, lon: number}>}
   */
  async getCoordinates(city) {
    if (!city) {
      throw new Error('Не указан город');
    }

    const response = await fetch(
      `${WeatherService.BASE_URL}/weather?q=${city}&units=metric&lang=ru&appid=${this.apiKey}`,
    );

    if (!response.ok) {
      this.handleApiError(response.status);
    }
    // Парсинг JSON-ответа
    const data = await response.json();
    // Проверка наличия координат в ответе
    if (!data || !data.coord) {
      throw new Error('Не удалось получить координаты города');
    }
    return data.coord; // Возвращаем координаты
  } // end getCoordinates

  /**
   * Получение информации о погоде по координатам
   * @param {number} lat - Широта
   * @param {number} lon - Долгота
   * @returns {Promise<WeatherInfo>}
   */
  async getWeatherInfo(lat, lon) {
    if (!lat || !lon) {
      throw new Error('Не указаны координаты');
    }

    const response = await fetch(
      `${WeatherService.BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&lang=ru&appid=${this.apiKey}`,
    );

    if (!response.ok) {
      this.handleApiError(response.status);
    }

    const data = await response.json();

    if (!data || !data.weather || !data.weather[0]) {
      throw new Error('Не удалось получить данные о погоде');
    }

    return {
      coord: data.coord,
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      iconCode: data.weather[0].icon,
      iconUrl: `https://openweathermap.org/img/w/${data.weather[0].icon}.png`,
    };
  }
}
