async function getLocationAsync() {
  try {
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
    if (!response.ok) {
      Promise.reject(
        new Error(
          `Ошибка при получении данных о местоположении: ${response.status}`,
        ),
      );
    }

    const data = await response.json();
    // console.log('Ваше местоположение:', data);
    return data;
  } catch (error) {
    // console.log(error);
    return null;
  }
}

const insertCityToEditor = new Promise((resolve, reject) => {
  getLocationAsync()
    .then((locationData) => {
      if (!locationData || !locationData.city) {
        Promise.reject(new Error('Не удалось получить местоположение'));
        return;
      }

      const cityEditor = document.getElementById('city-editor');
      if (!cityEditor) {
        Promise.reject(
          new Error("Не удалось найти элемент с классом 'city-editor'"),
        );
        return;
      }
      cityEditor.value = locationData.city;
      resolve(locationData.city);
    })
    .catch((error) => {
      reject(error);
    });
});

insertCityToEditor
  .then((city) => {
    console.log(`Город вставлен в редактор: ${city}`);
  })
  .catch((error) => {
    console.error('Ошибка при вставке города: ', error);
  });

getLocationAsync();
