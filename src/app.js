// {"X-Yandex-Weather-Key":"demo_yandex_weather_api_key_ca6d09349ba0"}
// openweather API KEY ce2efde41862706bd2d4973c702caa1b
// https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
const cityEditor = document.getElementById('city-editor');
const enterBtn = document.getElementById('enter-btn');
const cityHistoryList = document.querySelector('.city-history');

const weatherIcon = document.querySelector('.weather-icon');
const weatherDescription = document.querySelector('.weather-description');
const weatherTemp = document.querySelector('.weather-temp');
const mapContainer = document.getElementById('map-container');

// Функция для загрузки истории городов из localStorage
function loadCityHistory() {
  const history = JSON.parse(localStorage.getItem('cityHistory')) || [];
  return history;
}
// Функция для отображения истории городов
function displayCityHistory() {
  const history = loadCityHistory();

  // Очищаем текущий список
  cityHistoryList.innerHTML = '';

  // Добавляем каждый город как элемент списка
  history.forEach((city) => {
    const listItem = document.createElement('li');
    listItem.textContent = city;
    // Добавляем обработчик клика
    listItem.addEventListener('click', () => {
      // Устанавливаем значение в поле ввода
      cityEditor.value = city;

      // Имитируем клик по кнопке поиска
      enterBtn.click();
    });

    cityHistoryList.appendChild(listItem);
  });
}

// Функция для сохранения истории городов в localStorage
function saveCityHistory(city) {
  let history = loadCityHistory();

  // Проверяем, есть ли уже такой город в истории
  const cityIndex = history.indexOf(city);

  // Если город уже есть в истории, удаляем его
  if (cityIndex !== -1) {
    history.splice(cityIndex, 1);
  }

  // Добавляем город в список
  history.push(city);

  // Сортируем список по алфавиту
  history.sort();

  // Ограничиваем список до 10 элементов
  if (history.length > 10) {
    history = history.slice(0, 10);
  }

  // Сохраняем обновленную историю
  localStorage.setItem('cityHistory', JSON.stringify(history));

  // Обновляем отображение истории
  displayCityHistory();
}

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
function getCoordinates(cityName) {
  return new Promise((resolve, reject) => {
    if (!cityName) {
      reject(new Error('Не указан город'));
      return;
    }

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=ce2efde41862706bd2d4973c702caa1b`,
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
function getWeatherInfo(lat, lon) {
  return new Promise((resolve, reject) => {
    if (!lat || !lon) {
      reject(new Error('Не указаны координаты'));
      return;
    }
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=ce2efde41862706bd2d4973c702caa1b`,
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

// Получение информации о погоде и отображение на странице
function getWeather(city) {
  getCoordinates(city)
    .then(({ lat, lon }) => {
      getWeatherInfo(lat, lon)
        .then((weather) => {
          // Сохраняем город в историю
          saveCityHistory(city);

          weatherIcon.src = weather.iconUrl;
          weatherIcon.alt = weather.description;
          weatherDescription.textContent = weather.description;
          weatherTemp.textContent = `${weather.temp} °C`;
          const mapUrl = `https://static-maps.yandex.ru/v1?ll=${lon},${lat}&lang=ru_RU&size=650,450&z=10&apikey=578cfe4c-8ea6-4ace-a418-31752d498590`;
          // загружаем картинку карты в div mapContainer
          mapContainer.style.backgroundImage = `url(${mapUrl})`;
          mapContainer.style.backgroundSize = 'cover';
          mapContainer.style.backgroundRepeat = 'no-repeat';
          mapContainer.style.backgroundPosition = 'center';
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

// Обработчик события нажатия Enter в поле ввода города
cityEditor.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    enterBtn.click();
  }
});

// Загружаем историю при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  displayCityHistory();
});
