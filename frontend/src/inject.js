setInterval(() => {
  chrome.storage.sync.get(['enabled'], items => {
    const element = document.getElementById('dialog-id');
    if (element) {
      if (items.enabled) {
        element.style.display = 'inherit';
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

