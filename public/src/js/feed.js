const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.transform = 'translateY(0)';

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

