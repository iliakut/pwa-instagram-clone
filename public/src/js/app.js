let defferetPrompt;
let enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  // serviceWorker работает только с https (кроме localhost)
  navigator.serviceWorker
    .register('/sw.js', /* {scope: '/help/'} */) // scope - позволяет работать только с конкретными страницами
    .then(function () {
      console.log('ServiceWorker registered');
    })
    .catch(function (err) {
      console.log(err);
    })
}

window.addEventListener('beforeinstallprompt', function (event) {
  /*
  * баннер установки можно превентить (чтобы он не появлялся сам)
  * и вызвать его в другом месте
  *
  * update: событие в новых версиях запускается каждый раз, но не вызывает баннер
  * значит его можно вызвать в другом месте (см. кнопка плюс в feed.js)
  * при этом его можно вызывать сколько угодно раз
  */
  console.log('beforeinstallprompt fired')
  event.preventDefault();
  defferetPrompt = event;
  return false;
})

function displayConfirmNotification() {
  const options = {
    body: 'You successfully subscribed to our notification service!'
  }

  new Notification('Successfully subscribed!', options);
}

function asnForNotificationPermission() {
  Notification.requestPermission(function (result) {
    console.log('user choice', result);
    if (result !== 'granted') {
      console.log('no notification permission granted!');
    } else {
      displayConfirmNotification();
    }
  })
}

if ('Notification' in window) {
  for (let i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', asnForNotificationPermission);
  }
}