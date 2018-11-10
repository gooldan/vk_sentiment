const APP_ID = 6746872;
const API_VERSION = `5.37`;

const AUTH_HOST = 'https://oauth.vk.com';
const AUTH_HTML = AUTH_HOST + '/authorize?';
const BLANK_URL = AUTH_HOST + '/blank.html';

const SERVER = 'http://192.168.1.62:8080';

const login = (callback) => {
  const codeUrl = AUTH_HTML +
    `client_id=${APP_ID}&` +
    `redirect_uri=${BLANK_URL}&` +
    `display=popup&` +
    `scope=messages,offline&` +
    `response_type=code&` +
    `v=${API_VERSION}`;
  chrome.windows.create({ url: codeUrl, width: 600, height: 400, type: 'popup' }, window => {
    const listener = (tabId, changeInfo, tab) => {
      if (tabId === window.tabs[0].id && changeInfo.url) {
        const url = new URL(tab.url);
        if (!url.searchParams.has(`client_id`)) {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.windows.remove(window.id);
        } else {
          return;
        }
        const hash = url.hash.split(`=`);
        if (hash.length === 2) {
          const urlAuth = SERVER + `/auth/init?code=${hash[1]}&redirectUri=${BLANK_URL}`;
          const request = new XMLHttpRequest();
          request.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
              const userId = JSON.parse(request.response);
              callback(userId);
              getMessages(userId);
            }
          };
          request.open('GET', urlAuth, true);
          request.send();
        } else {
          callback(null);
        }
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
};

const getMessages = (userId) => {
  const urlAuth = SERVER + `/api/messages?userId=${userId}`;
  const request = new XMLHttpRequest();
  request.open('GET', urlAuth, true);
  request.send();
};
