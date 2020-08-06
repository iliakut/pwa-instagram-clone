if ('serviceWorker' in navigator) {
  // serviceWorker работает только с https (кроме localhost)
  navigator.serviceWorker
    .register('/sw.js', /* {scope: '/help/'} */) // scope - позволяет работать только с конкретными страницами
    .then(function () {
      console.log('ServiceWorker registered');
    })
}
