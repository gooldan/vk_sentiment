let messageCache = new Map();
let tabId = null;
const visualisedCache = new Map();
let timer = null;
let enabled = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_DIALOG') {
    tabId = message.tabId;
    timer = createTimer();
  } else if (message.type === 'CLOSE_DIALOG' && timer) {
    clearInterval(timer);
    visualisedCache.clear();
  }
});

function createTimer() {
  return setInterval(() => {
    chrome.storage.sync.get(['enabled'], items => {
      if (items.enabled) {
        Array.from(document.getElementsByClassName('im-mess _im_mess')).forEach(messageElement => {
          const id = messageElement.getAttribute('data-msgid');
          const element = visualisedCache.get(id);
          if (element) {
            if (!enabled) {
              element.style.display = 'inherit';
            }
            return;
          }
          messageCache.set(id, 0);
          const idElement = document.createElement('div');
          idElement.className = 'message-sentiment';
          idElement.style.backgroundColor = getColorForPercentage(1);
          idElement.title = 'Test';
          messageElement.appendChild(idElement);
          visualisedCache.set(id, idElement);
        });
      } else if (enabled) {
        visualisedCache.forEach(element => element.style.display = 'none');
      }
      enabled = items.enabled;
    });
  }, 50);
}
