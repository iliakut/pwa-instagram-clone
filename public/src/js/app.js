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
  // нотификация через воркер
  if ('serviceWorker' in navigator) {
    const options = {
      body: 'You successfully subscribed to our notification service! (body)',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.png',
      dir: 'ltr',
      lang: 'en-US',
      vibrate: [100, 50, 200], // вибрация
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification', // как отображаются несоклько нотификаций
      renotify: true, // нотификации с одним тегом будут (false - не будут) приходить
      actions: [ // появляются в SW
        { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    }

    navigator.serviceWorker.ready
      .then(function (swreg) {
        swreg.showNotification('Successfully subscribed! (from SW)', options)
      });
  }

  // нотификация со страницы из браузера
  // new Notification('Successfully subscribed!');
}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) return;

  let reg;
  navigator.serviceWorker.ready
    .then(function (swreg) {
      reg = swreg;
      swreg.pushManager.getSubscription();
    })
    .then(function (sub) {
      if (sub === null) {
        // Create a new sub
        const vapidPublicKey = '...';
        const convertedVapidPublicKey = '...' //urlBase64Uint8Array(vapidPublicKey);
        reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey
        });
      } else {
      }
    })
    .then(function (newSub) {
      // также необходимо очищать старые подписки после переригестрации сервис воркера
      return fetch('server', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          body: JSON.stringify(newSub)
        }
      })
    })
    .then(function (res) {
      if (res.ok) {
        displayConfirmNotification()
      }
    })
    .catch(function (err) {
      console.log(err)
    })


};

function asnForNotificationPermission() {
  Notification.requestPermission(function (result) {
    console.log('user choice', result);
    if (result !== 'granted') {
      console.log('no notification permission granted!');
    } else {
      // displayConfirmNotification();
      configurePushSub();
    }
  })
}

// включение нотификаций
if ('Notification' in window && 'serviceWorker' in navigator) {
  for (let i = 0; i < enableNotificationsButtons.length; i++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', asnForNotificationPermission);
  }
}