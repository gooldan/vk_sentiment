chrome.runtime.onInstalled.addListener(() => {
  login((userId) => {
    chrome.storage.sync.set({ 'enabled': !!userId });

    const tabs = new Set();

    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      const url = new URL(tab.url);
      if (changeInfo.url || changeInfo.status === 'loading') {
        if (url.protocol === 'https:' && url.host === 'vk.com' && url.pathname === '/im' && url.search && url.searchParams.has('sel')) {
          tabs.add(tabId);
        } else {
          chrome.tabs.sendMessage(tabId, { type: 'CLOSE_DIALOG' });
        }
      }

      if (changeInfo.status === 'complete' && tabs.delete(tabId)) {
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
          if (message.tabId === tabId) {
            dataRequest(userId, message.id, sendResponse);
          } else {
            sendResponse({});
          }
          return true;
        });

        chrome.tabs.sendMessage(tabId, { tabId, dialogId: url.searchParams.get('sel'), type: 'OPEN_DIALOG' });
      }
    });
  });
});

function dataRequest(userId, id, callback) {
  const urlLoad = SERVER + `/api/sentiment?userId=${userId}&messageId=${id}`;
  const request = new XMLHttpRequest();
  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      callback(JSON.parse(request.response));
    }
  };
  request.open('GET', urlLoad, true);
  request.send();
}