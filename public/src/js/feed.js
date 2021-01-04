const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const videoPlayer = document.querySelector('#player');
const canvasElement = document.querySelector('#canvas');
const captureButton = document.querySelector('#capture-btn');
const imagePicker = document.querySelector('#image-picker');
const imagePickerArea = document.querySelector('#pick-image');

function initializeMedia() {
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = function(constraints) {
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented!'));
      }

      return new Promise(function(resolve, reject) {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    }
  }

  navigator.mediaDevices.getUserMedia({video: true})
    .then(function(stream) {
      videoPlayer.srcObject = stream;
      videoPlayer.style.display = 'block';
    })
    .catch(function(err) {
      imagePickerArea.style.display = 'block';
    });
};

captureButton.addEventListener('click', function(event) {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  const context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach(function(track) {
    track.stop();
  });
  picture = dataURItoBlob(canvasElement.toDataUrl());
});

function openCreatePostModal() {
  createPostArea.style.transform = 'translateY(0)';
  initializeMedia();

  if (defferetPrompt) {
    // если уже пытались установить, можно запустить в другом месте, тут:
    defferetPrompt.prompt();

    defferetPrompt.userChoice.then(function (choiceResult) {
      // если пользователь кликнул на баннер установки (установил или нет)
      console.log(choiceResult)

      if (choiceResult.outcome === 'dismissed') {
        console.log('user cancelled installation')
      } else {
        console.log('user added to home screen')
      }
    })

    // сотрем переменную
    defferetPrompt = null;
  }

  /*
  * удаление сервис воркера
  */
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function (registrations) {
  //       for (let registration of registrations) {
  //         registration.unregister();
  //       }
  //
  //     })
  // }
}

function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
  // createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

/*
* для кеширование по требованию пользовательских запросов
*/
function onSaveButtonClicked(event) {
  console.log('clicked')

  /*
  * пользовательский код также имеет доступ к кэшку сервис воркера
  */
  if ('caches' in window) {
    caches.open('user-requested') // кэш запросов пользователя
      .then(function (cache) {
        cache.add('https://httpbin.org/get');
        cache.add('./src/images/sf-boat.jpg');
      });
  }
}

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}

// Create card stub
function createCard(data) {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url(${data.image})`;
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'black'
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // const cardSaveButton = document.createElement('button')
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked)
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards();
  data.forEach((i) => {
    createCard(i);
  });
}

const url = 'https://pwagram-92c0e.firebaseio.com/posts.json';
let networkDataReceived = false;

fetch(url)
  .then(function(res) {
    return res.json();
  })
  .then(function(data) {
    networkDataReceived = true;
    console.log('From web', data)
    const dataArray = [];
    for (let key in data) {
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
  });

// idb
if ('indexedDB' in window) {
  readAllData('posts')
    .then(function (data) {
      if (!networkDataReceived) {
        console.log('From idb', data);
        updateUI(data);
      }
    })
}

// cache
// if ('caches' in window) {
//   caches.match(url)
//     .then(function (response) {
//       if (response) {
//         return response.json();
//       }
//     })
//     .then(function (data) {
//       console.log('From cache', data);
//       if (!networkDataReceived) {
//         const dataArray = [];
//         for (let key in data) {
//           dataArray.push(data[key]);
//         }
//         updateUI(dataArray);
//       }
//     })
// }

function sendData() {
  fetch('https://pwagram-92c0e.firebaseio.com/posts.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-92c0e.appspot.com/o/resilence-chicago.jpg?alt=media&token=e58f7c8d-e8be-4d09-b314-9a70cd94c5fd'
    })
  })
    .then(function (res) {
      console.log('Sent data', res);
      updateUI();
    })
    .catch(function (err) {
      console.log(err);
    })
};

form.addEventListener('submit', function (event) {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data!');
    return;
  }

  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) { // SyncManager - API для background sync
    navigator.serviceWorker.ready
      .then(function (sw) {
        const post = {
          id: new Date().toISOString(),
          title: titleInput.value,
          location: locationInput.value
        }
        writeData('sync-posts', post) // записать пост в iDB
          .then(function () {
            return sw.sync.register('sync-new-posts'); // регистрация SyncManager, tag - имя sync тега
          })
          .then(function () {
            // нотификация
            const snackbarContainer = document.querySelector('#confirmation-toast');
            const data = { message: 'Your post was saved for syncing!' };
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(function (err) {
            console.log(err);
          });
      });
  } else {
    sendData();
  }
});
