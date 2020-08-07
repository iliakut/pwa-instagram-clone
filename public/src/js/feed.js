var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function openCreatePostModal() {
  createPostArea.style.display = 'block';

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
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
