const CACHE_STATIC_NAME = 'static-v11';
const CACHE_DYNAMIC_NAME = 'dynamic-v2'
const STATIC_FILES = [
  '/', //запрос по умолчанию тоже нужно кэшировать
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/promise.js', // не нужны для современных браузеров и в любом случае, sw не поддерживается в старых
  '/src/js/fetch.js',  // но все-равно загрузим полифилы для ускорения загрузки страницы
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
]

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
    caches.open(CACHE_STATIC_NAME) // static - просто имя кэша, для обновления закешированных данных
      /*
      * нужно вести версионирование, чтобы создавать новый кеш при обновлении основного кода
      * помимо этого нужно чистить старый кэш
      */
      .then(function (cache) {
        console.log('[ServiceWorker] precaching App Shell')
        /*
        * после выполнения промиса
        * методом add добавим в кэш по роуту файл
        * (на самом деле метод пойдет к серверу,
        * запросит файл и положит его в кэш)
        *  это специфика функции add (addAll)
        */
        cache.addAll(STATIC_FILES)
      })
  );
})

self.addEventListener('activate', function (event) {
  /*
  * activate - вызывается, когда произошла установка нового воркена
  * вызывается браузером
  * после обновления кода сервис воркера необходимо закрыть и открыть вкладку заново для регистрации
  * так как браузер может думать, что страница все еще общается со старой версией сервис воркера
  *
  * можно вручную в консоле разработчика сделать переригестрацию
  */
  console.log('[ServiceWorker] activating...', event)
  event.waitUntil( // приостановит автивацию до тех пор, пока не закончатся все дейтсив
    caches.keys() // получим ключи всех кэшев
      .then(function (keyList) { // keyList - массив строк с ключами
        return Promise.all(keyList.map(function (key) {
          /*
          * если кэш не равен нашему текущему (то есть старая версия)
          * и это не динамический кэш, произведем чистку старых кэшев
          */
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service worker]  removing old cache', key);
            return caches.delete(key); // удалить кэш по ключу
            // - .delete() - возвращает промис мы возвращаем его, чтобы Promise.all выполнил их все (удаления)
          }
        }));
      })
  )
  return self.clients.claim();
})

// self.addEventListener('fetch', function (event) {
//   /*
//   * вызывается страницей
//   * срабатывает, когда страница запрашивает что-то
//   */
//
//   /*
//   * respondWith позволяет сервис воркеру перехватить запрос и ответить промисом
//   * fetch(event.request) - просто вернет тот же запрос
//   * caches.match(event.request) - проверяет, есть ли в кэше данный запрос
//   *   если есть вернет то что хранится в кэше, если нет вернет undefined
//   */
//   event.respondWith( // перехватили запрос
//     caches.match(event.request) // проверили наличие в кэше
//       .then(function (response) {
//         if (response) {  // если есть в кэше
//           return response; // вернули то что в кэше
//         } else { // если нет
//           return fetch(event.request) // вернули тот же запрос (который ушел запрашиваться дальше)
//             .then(function (response) { // после исполонения запроса получим результат (response)
//                return caches.open(CACHE_DYNAMIC_NAME) // откроем или создатим dynamic кэш
//                 .then(function (cache) { // после открытия или создания кэша
//                   cache.put(event.request.url, response.clone()) // положим response данного урла в кэш put - не делает доп. запрос, а кладет по ключу
//                   // response.clone() - нужно сделать клон, так как response используется тоьлко один раз
//                   return response; // необходимо делать return чтобы вернуть ответ оригинальном запросу (который пришел из страницы)
//                 })
//             })
//             .catch(function (error) { // обработка ошибок
//               /*
//               * если не нашли закешированной страницы
//               * вернем страницу offline.html
//               * это вызовет сайд-эффект, что если мы не закешировали
//               * какой-то пользовательский запрос, то попадем на эту страницу
//               */
//               return caches.open(CACHE_STATIC_NAME)
//                 .then(function (cache) {
//                   return cache.match('/offline.html');
//                 })
//             })
//         }
//       })
//   );
//
// });

// Стратегия cache-only - когда все берется из кеша, можно кэшировать только статичные страницы
// Стратегия network only - когда sw возвращает все сетевые запросы и ничего не кешируется

/*
* Стратегия network with cache-fallback
* стратегия плоха тем, что если меделнные ответы, плохой интернет
* пользователю придется ждать ответа
*/
// self.addEventListener('fetch', function (event) {
//   event.respondWith( // перехватили запрос
//     fetch(event.request) // сделали запрос
//       .then(function (res) { // получили ответ
//         return caches.open(CACHE_DYNAMIC_NAME)
//           .then(function (cache) {
//             cache.put(event.request.url, res.clone()) // закешировали ответ
//             return res // вернули ответ
//           })
//       })
//       .catch(function (err) {
//         return caches.match(event.request) // вернули кэш если запрос не удался
//       })
//   );
// });

/*
* Стратегия cache then network
* страница получает данные из кэша,
* если есть обновленные данные, то они сначала загружаются в кэш
* затем передаются странице.
* Нужно прописать логику и в sw и на странице
*/
self.addEventListener('fetch', function (event) {
  const url = 'https://httpbin.org/get';
  // эта часть реализует cache then network
  if (event.request.url.indexOf(url) > -1) { // если в запросе есть url - см. константу выше
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(function (cache) {
          return fetch(event.request)
            .then(function (res) {
              cache.put(event.request, res.clone());
              return res;
            })
        })
    );
  } else { // offline поддержка cache with network fallback
    event.respondWith(
      caches.match(event.request) // проверили наличие в кэше
        .then(function (response) {
          if (response) {  // если есть в кэше
            return response; // вернули то что в кэше
          } else { // если нет
            return fetch(event.request) // вернули тот же запрос (который ушел запрашиваться дальше)
              .then(function (response) { // после исполонения запроса получим результат (response)
                 return caches.open(CACHE_DYNAMIC_NAME) // откроем или создатим dynamic кэш
                  .then(function (cache) { // после открытия или создания кэша
                    cache.put(event.request.url, response.clone()) // положим response данного урла в кэш put - не делает доп. запрос, а кладет по ключу
                    return response; // необходимо делать return чтобы вернуть ответ оригинальном запросу (который пришел из страницы)
                  })
              })
              .catch(function (error) { // обработка ошибок
                return caches.open(CACHE_STATIC_NAME)
                  .then(function (cache) {
                    if (event.request.headers.get('accept').includes('text/html')) { // только страницы нуждается в фалбеке в виде офлайн страницы
                      return cache.match('/offline.html'); // другие запросы, например css не нуждаются в этой странице
                      // но можно сделать фалбэк на картинки например
                    }
                  })
              })
          }
        })
    )
  }
});
