/*
* indexedDB
* idb.open(имя, версия, колбэк)
*/
const dbPromise = idb.open('post-store', 1, function (db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', {keyPath: 'id'});
  }
});

function writeData(stName, data) {
  return dbPromise // запись данных в iDB
    .then(function (db) {
      const tx = db.transaction(stName, 'readwrite'); // transaction
      const store = tx.objectStore(stName);
      store.put(data);
      return tx.complete;
    })
}