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
  element.addEventListener('change', event => {
    if (event.target.checked) {
      login(token => {
        if (!token) {
          event.target.checked = false;
        }
        chrome.storage.sync.set({ 'enabled': !!token })
      });
    } else {
      chrome.storage.sync.set({ 'enabled': false })
    }
  });
}

onLoad();