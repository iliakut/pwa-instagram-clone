self.addEventListener('install', function (event) {
  /*
  * вызывается браузером
  * запускается когда браузер устанавливает воркер
  */
  console.log('[ServiceWorker] installing...', event)
})

self.addEventListener('activate', function (event) {
  /*
  * вызывается браузером
  * после обновления кода сервис воркера необходимо закрыть и открыть вкладку заново для регистрации
  * так как браузер может думать, что страница все еще общается со старой версией сервис воркера
  *
  * можно вручную в консоле разработчика сделать переригестрацию
  */
  console.log('[ServiceWorker] activating...', event)
  return self.clients.claim();
})

self.addEventListener('fetch', function (event) {
  // вызывается страницей
  // срабатывает, когда страница запрашивает что-то
  console.log('[ServiceWorker] fetching...', event)
  /*
  * respondWith позволяет сервис воркеру перехватить запрос и ответить промисом
  * fetch(event.request) - просто вернет тот же запрос
  */
  event.respondWith(fetch(event.request));

});
