chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ 'enabled': true });

  const tabs = new Set();

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    const url = new URL(tab.url);
    if (((changeInfo.url || changeInfo.status === 'loading') &&
      url.protocol === 'https:' && url.host === 'vk.com' && url.pathname === '/im' && url.search && url.searchParams.has('sel'))) {
      tabs.add(tabId);
    }
    if (changeInfo.status === 'complete' && tabs.delete(tabId)) {
      chrome.tabs.sendMessage(tabId, { dialogId: url.searchParams.get('sel') });
    }
  });
});