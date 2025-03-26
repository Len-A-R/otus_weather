// Модуль для работы с диалогом ошибок
export const ErrorDialog = {
  dialogElement: null,
  messageElement: null,
  closeButton: null,
  okButton: null,

  init() {
    this.dialogElement = document.getElementById('error-dialog');
    this.messageElement = document.getElementById('error-message');
    this.closeButton = document.querySelector('.error-dialog-close');
    this.okButton = document.getElementById('error-dialog-ok');

    // Добавляем обработчики событий
    this.closeButton.addEventListener('click', () => this.hide());
    this.okButton.addEventListener('click', () => this.hide());

    // Закрытие при клике вне диалога
    this.dialogElement.addEventListener('click', (event) => {
      if (event.target === this.dialogElement) {
        this.hide();
      }
    });

    // Закрытие по нажатию Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isVisible()) {
        this.hide();
      }
    });
  },

  show(message, title = 'Ошибка') {
    // Устанавливаем сообщение об ошибке
    this.messageElement.textContent = message;

    // Устанавливаем заголовок, если нужно
    const headerTitle = this.dialogElement.querySelector(
      '.error-dialog-header h3',
    );
    if (headerTitle) {
      headerTitle.textContent = title;
    }

    // Показываем диалог
    this.dialogElement.style.display = 'flex';

    // Фокусируемся на кнопке OK
    this.okButton.focus();
  },

  hide() {
    this.dialogElement.style.display = 'none';
  },

  isVisible() {
    return this.dialogElement.style.display === 'flex';
  },
};
