chrome.runtime.onInstalled.addListener(() => {
  login((token) => {
    chrome.storage.sync.set({ 'enabled': !!token });

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
        chrome.tabs.sendMessage(tabId, { tabId, dialogId: url.searchParams.get('sel'), type: 'OPEN_DIALOG' });
      }
    });
  });
});