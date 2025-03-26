export class CityHistoryManager {
  constructor(config, cityEditor, cityHistoryList, enterBtn) {
    this.maxHistoryItems = config.MAX_HISTORY_ITEMS || 10;
    this.cityEditor = cityEditor;
    this.cityHistoryList = cityHistoryList;
    this.enterBtn = enterBtn;
  }

  /**
   * Загрузка истории городов из localStorage
   * @returns;
   */
  static load() {
    return JSON.parse(localStorage.getItem('cityHistory')) || [];
  }

  /**
   * Сохранение истории городов в localStorage
   * @param {*} city - название населенного пукт
   * @returns
   */
  save(city) {
    if (!city) {
      return;
    }
    const history = CityHistoryManager.load();
    // Если город уже есть в истории, удаляем его
    if (history.includes(city)) {
      return;
    }
    // Добавляем город в начало списка
    history.unshift(city);

    // Ограничиваем список до 10 элементов
    if (history.length > this.maxHistoryItems) {
      history.pop();
    }

    // Сохраняем новую историю городов в localStorage
    localStorage.setItem('cityHistory', JSON.stringify(history));
  }

  /**
   * Отображение истории городов в виде списка
   * @returns {void}
   */
  display() {
    const history = CityHistoryManager.load();
    this.cityHistoryList.innerHTML = '';
    history.forEach((city) => {
      const listItem = document.createElement('li');
      listItem.textContent = city;
      listItem.addEventListener('click', () => {
        this.cityEditor.value = city;
        this.enterBtn.click();
      });
      this.cityHistoryList.appendChild(listItem);
    });
  }
}
