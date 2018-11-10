const APP_ID = 6746872;
const API_VERSION = `5.37`;

const AUTH_HOST = 'https://oauth.vk.com';
const AUTH_HTML = AUTH_HOST + '/authorize?';
const BLANK_URL = AUTH_HOST + '/blank.html';

const LOCALHOST = 'http://127.0.0.1:8080';

const login = (callback) => {
  const codeUrl = AUTH_HTML +
    `client_id=${APP_ID}&` +
    `redirect_uri=${BLANK_URL}&` +
    `display=popup&` +
    `scope=messages,offline&` +
    `response_type=code&` +
    `v=${API_VERSION}`;
  chrome.tabs.create({ url: codeUrl, active: false }, tokenTab => {
    const listener = (tabId, changeInfo, tab) => {
      if (tabId === tokenTab.id && changeInfo.url) {
        const url = new URL(tab.url);
        if (!url.searchParams.has(`client_id`)) {
          chrome.tabs.onUpdated.removeListener(listener);
          chrome.tabs.remove(tabId);
        } else {
          return;
        }
        const hash = url.hash.split(`=`);
        if (hash.length === 2) {
          const urlAuth = LOCALHOST + `/auth/init?code=${hash[1]}&redirectUri=${BLANK_URL}`;
          const request = new XMLHttpRequest();
          request.open('GET', urlAuth, false);
          try {
            request.send();
          } catch (e) {
            console.error(e);
          }
          const userId = JSON.parse(request.response);
          callback(userId);
          getMessages(userId);
        } else {
          callback(null);
        }
      }
    };
    chrome.tabs.onUpdated.addListener(listener);
  });
};

const getMessages = (userId) => {
  const urlAuth = LOCALHOST + `/api/messages?userId=${userId}`;
  const request = new XMLHttpRequest();
  request.open('GET', urlAuth, false);
  try {
    request.send();
  } catch (e) {
    console.error(e);
  }
};
