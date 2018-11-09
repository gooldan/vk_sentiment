async function onLoad() {
  const switchPromise = new Promise(resolve => {
    const interval = setInterval(() => {
      const element = document.getElementById('enable-switch');
      if (element != null) {
        clearInterval(interval);
        resolve(element);
      }
    }, 50);
  });
  const element = await switchPromise;

  chrome.storage.sync.get(['enabled'], items => {
    element.checked = items.enabled;
    if (!element.classList.contains('visible')) {
      document.getElementById('container').classList.add('visible');
    }
  });
  element.addEventListener('change', event => chrome.storage.sync.set({ 'enabled': event.target.checked }));
}

onLoad();