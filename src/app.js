/* global ymaps */
// {"X-Yandex-Weather-Key":"demo_yandex_weather_api_key_ca6d09349ba0"}
// openweather API KEY ce2efde41862706bd2d4973c702caa1b
// https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}

const WEATHER_API_KEY = 'ce2efde41862706bd2d4973c702caa1b';
// const YANDEX_MAP_API_KEY = 'db731357-dfe6-4929-944b-b4ab85d8cddd';
const cityEditor = document.getElementById('city-editor');
const enterBtn = document.getElementById('enter-btn');
const weatherInfo = document.getElementById('weather-info');

let yandexMap;
let mapInitialized = false;
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
// Координаты города
function getCoordinates(cityName, apiKey) {
  return new Promise((resolve, reject) => {
    if (!cityName) {
      reject(new Error('Не указан город'));
      return;
    }
    if (!apiKey) {
      reject(
        new Error(
          'Не указан ключ API см. https://openweathermap.org/current#geocoding',
        ),
      );
      return;
    }

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`,
    )
      .then((response) => {
        if (!response.ok) {
          if (response.status === 404) {
            reject(new Error('Город не найден'));
          }

          if (response.status === 401) {
            reject(
              new Error(
                'Неверный ключ API см. https://openweathermap.org/current#geocoding',
              ),
            );
          }
          reject(
            new Error(
              `Ошибка при получении данных о погоде: ${response.status}`,
            ),
          );
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.coord) {
          const { lat, lon } = data.coord;
          resolve({ lat, lon });
        } else {
          reject(new Error('Не удалось получить координаты города'));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}
// Информация о погоде
function getWeatherInfo(lat, lon, apiKey) {
  return new Promise((resolve, reject) => {
    if (!lat || !lon || !apiKey) {
      reject(new Error('Не указаны координаты или ключ API'));
      return;
    }
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`,
    )
      .then((response) => {
        if (!response.ok) {
          reject(
            new Error(
              `Ошибка при получении данных о погоде: ${response.status}`,
            ),
          );
        }
        return response.json();
      })
      .then((data) => {
        if (data && data.weather && data.weather.length > 0) {
          const weatherData = {
            coord: data.coord,
            temp: Math.round(data.main.temp - 273.15),
            description: data.weather[0].description,
            iconCode: data.weather[0].icon,
            iconUrl: `https://openweathermap.org/img/w/${data.weather[0].icon}.png`,
          };
          resolve(weatherData);
        } else {
          reject(new Error('Не удалось получить данные о погоде'));
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

// Инициализация карты Яндекс Карт
function initYandexMap(lat, lng, cityName) {
  // Если карта уже инициализирована, просто обновляем центр и маркер
  if (mapInitialized && yandexMap) {
    yandexMap.setCenter([lat, lng], 10);
    // Очищаем все метки
    yandexMap.geoObjects.removeAll();
    // Добавляем новую метку
    yandexMap.geoObjects.add(
      new ymaps.Placemark([lat, lng], {
        balloonContent: cityName,
      }),
    );
    return;
  }
  // Инициализируем карту при первом вызове
  ymaps.ready(() => {
    yandexMap = new ymaps.Map('map-container', {
      center: [lat, lng],
      zoom: 12,
      controls: [],
      copyrightLogoVisible: false,
      copyrightProvidersVisible: false,
      copyrightUaVisible: false,
    });

    // Добавляем метку на карту
    yandexMap.geoObjects.add(
      new ymaps.Placemark([lat, lng], {
        balloonContent: cityName,
      }),
    );

    mapInitialized = true;
  });
}

// Получение информации о погоде и отображение на странице
function getWeather(city) {
  getCoordinates(city, WEATHER_API_KEY)
    .then(({ lat, lon }) => {
      getWeatherInfo(lat, lon, WEATHER_API_KEY)
        .then((weather) => {
          weatherInfo.innerHTML = `
          <p>Погода в ${city}</p>
          <p>Температура: ${weather.temp}°C</p>
          <p>Описание: ${weather.description}</p>
          <img class="weather-icon" src="${weather.iconUrl}" alt="${weather.description}">
          `;
          initYandexMap(weather.coord.lat, weather.coord.lon, city);
        })
        .catch((error) => {
          alert(`Ошибка: ${error.message}`);
        });
    })
    .catch((error) => {
      console.error('Ошибка при получении координат города:', error);
      alert(`Ошибка: ${error.message}`);
    });
}

// Обработчик события нажатия на кнопку "Enter"
getCurrentLocation().then((city) => {
  if (city) {
    cityEditor.value = city;
    getWeather(city);
  }
});

// Обработчик события нажатия на кнопку "Ввод"
enterBtn.addEventListener('click', () => {
  const city = cityEditor.value;
  if (!city) {
    alert('Необходимо ввести название города');
    return;
  }
  getWeather(city);
});
