const cache = new Map();

setInterval(() => {
  chrome.storage.sync.get(['enabled'], items => {
    const element = document.getElementById('dialog-id');
    if (element) {
      if (items.enabled) {
        element.style.display = 'inherit';
        Array.from(document.getElementsByClassName('im-mess')).forEach(element => {
          const id = element.getAttribute('data-msgid');
          if (cache.has(id)) {
            return;
          }
          cache.set(id, 0);
          const idElement = document.createElement('div');
          idElement.textContent = id;
          element.appendChild(idElement);
        });
      } else {
        element.style.display = 'none';
      }
    }
  });
}, 50);


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const element = document.createElement('div');
  element.textContent = message.dialogId;
  element.id = 'dialog-id';
  element.style.display = 'none';
  const prevElement = document.getElementById('dialog-id');
  if (prevElement) {
    prevElement.parentElement.removeChild(prevElement);
  }
  document.getElementsByClassName('im-page--aside').item(0).appendChild(element);
});

