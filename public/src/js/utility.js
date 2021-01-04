/*
* indexedDB
* idb.open(имя, версия, колбэк)
*/
const dbPromise = idb.open('post-store', 1, function (db) {
  // данные полученные с сервера
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {keyPath: 'id'});
  }

  // даннные для отправки на сервер
  if (!db.objectStoreNames.contains('sync-posts')) {
    db.createObjectStore('sync-posts', {keyPath: 'id'});
  }
});

function writeData (stName, data) {
  return dbPromise // запись данных в iDB
    .then(function (db) {
      const tx = db.transaction(stName, 'readwrite'); // transaction
      const store = tx.objectStore(stName);
      store.put(data);
      return tx.complete;
    })
}

function readAllData (stName) {
  return dbPromise
    .then(function (db) {
      const tx = db.transaction(stName, 'readonly');
      const store = tx.objectStore(stName);
      return store.getAll();
    })
}

/*
* удаление всех данных
*/
function clearAllData (stName) {
  return dbPromise
    .then(function (db) {
      const tx = db.transaction(stName, 'readwrite');
      const store = tx.objectStore(stName);
      store.clear(); // стереть всю базу
      return tx.complete;
    });
}

/*
* удалить данные по id
*/
function deleteItemFromIDB (stName, id) {
  return dbPromise
    .then(function (db) {
      const tx = db.transaction(stName, 'readwrite');
      const store = tx.objectStore(stName);
      store.delete(id); // стереть элемент по id
      return tx.complete;
    })
    .then(function () {
      console.log('Item deleted');
    })
}

function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], {type: mimeString});
}