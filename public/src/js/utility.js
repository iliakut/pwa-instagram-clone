/*
* indexedDB
* idb.open(имя, версия, колбэк)
*/
const dbPromise = idb.open('post-store', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {keyPath: 'id'});
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