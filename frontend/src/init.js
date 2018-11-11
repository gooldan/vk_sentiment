chrome.runtime.onInstalled.addListener(() => {
  login((userId) => {
    chrome.storage.sync.set({ 'enabled': !!userId });

    const tabs = new Set();
    const listeners = new Map();

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      const url = new URL(tab.url);
      if (changeInfo.url || changeInfo.status === 'loading') {

        const listener = listeners.get(tabId);
        if (listener) {
          chrome.runtime.onMessage.removeListener(listener);
        }

        const newListener = createListener(userId, tab, tabId);
        chrome.runtime.onMessage.addListener(newListener);
        listeners.set(tabId, newListener);

        if (url.protocol === 'https:' && url.host === 'vk.com' && url.pathname === '/im' && url.search && url.searchParams.has('sel')) {
          tabs.add(tabId);
        } else {
          chrome.tabs.sendMessage(tabId, { type: 'CLOSE_DIALOG' });
        }
      }

      if (changeInfo.status === 'complete' && tabs.delete(tabId)) {
        chrome.tabs.sendMessage(tabId, { tabId, dialogId: url.searchParams.get('sel'), type: 'OPEN_DIALOG' });
      }
    });
  });
});

const createListener = (userId, tab, tabId) => (message, sender, sendResponse) => {
  if (message.tabId === tabId) {
    if (message.type === 'online') {
      inputRequest(message.text, sendResponse);
    } else if (message.type === 'chart') {
      chartRequest(userId, Number((new URL(tab.url)).searchParams.get('sel')), sendResponse);
    } else if (message.type === 'message') {
      const newUrl = new URL(tab.url);
      newUrl.searchParams.set('msgid', message.messageId);
      chrome.tabs.update(tab.id, { url: newUrl.href }, sendResponse);
    } else {
      dataRequest(userId, message, sendResponse);
    }
  } else {
    sendResponse({});
  }
  return true;
}

function dataRequest(userId, message, callback) {
  const urlLoad = SERVER + `/api/sentiment`;
  const data = JSON.stringify({
    userId,
    messageId: message.id,
    text: message.text,
    ts: message.ts
  });
  const request = new XMLHttpRequest();
  request.open('POST', urlLoad, true);
  request.setRequestHeader('Content-type', 'application/json');
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      callback(JSON.parse(request.response));
    }
  };
  request.send(data);
}

function inputRequest(text, callback) {
  const urlLoad = SERVER + `/api/online`;
  const request = new XMLHttpRequest();
  request.open('POST', urlLoad, true);
  request.setRequestHeader('Content-type', 'application/json');
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      callback(JSON.parse(request.response));
    }
  };
  request.send(JSON.stringify({ text }));
}

function chartRequest(userId, peerId, callback) {
  const urlLoad = SERVER + `/api/graph?userId=${userId}&peerId=${peerId}`;
  const request = new XMLHttpRequest();
  request.open('GET', urlLoad, true);
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      callback(JSON.parse(request.response));
    }
  };
  request.send();
}