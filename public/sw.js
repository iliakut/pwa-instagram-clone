self.addEventListener('install', function (event) {
  /*
  * вызывается браузером
  * запускается когда браузер устанавливает воркер
  */
  console.log('[ServiceWorker] installing...', event)

  /*
  * открыть или создать кэш
  * является асинхронным методом, поэтому install может завершиться раньше,
  * чем установится кэш, т.е. при фетче мы будем обращаться в еще не созданный кэш
  * поэтому нужно добавить event.waitUntil() - метод,
  * который не завершит установку SW пока не установится кэш
  * caches open - открывает конкретный кэш или создает, если его нет
  */
  event.waitUntil(
    caches.open('static') // static - просто имя кэша
      .then(function (cache) {
        console.log('[ServiceWorker] precaching App Shell')
        /*
        * после выполнения промиса
        * методом add добавим в кэш по роуту файл
        * (на самом деле метод пойдет к серверу,
        *  запросит файл и положит его в кэш)
        */
        cache.add('/src/js/app.js');
      })
  );
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
  /*
  * вызывается страницей
  * срабатывает, когда страница запрашивает что-то
  */

  /*
  * respondWith позволяет сервис воркеру перехватить запрос и ответить промисом
  * fetch(event.request) - просто вернет тот же запрос
  * caches.match(event.request) - проверяет, есть ли в кэше данный запрос
  *   если есть вернет то что хранится в кэше, если нет вернет undefined
  */
  event.respondWith( // перехватили запрос
    caches.match(event.request) // проверили наличие в кэше
      .then(function (response) {
        if (response) {  // если есть в кэше
          return response; // вернули то что в кэше
        } else { // если нет
          return fetch(event.request); // вернули тот же запрос (который ушел запрашиваться дальше)
        }
      })
  );

});
