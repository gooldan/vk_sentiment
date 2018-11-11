let messageCache = new Map();
let tabId = null;
const visualisedCache = new Map();
let timer = null;
let enabled = null;
let chart = null;
let inputSentiment = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'OPEN_DIALOG') {
    tabId = message.tabId;
    timer = createTimer();
  } else if (message.type === 'CLOSE_DIALOG' && timer) {
    clearInterval(timer);
    removeInputSentiment();
    visualisedCache.clear();
  }
});

function createTimer() {
  return setInterval(() => {
    chrome.storage.sync.get(['enabled'], items => {
      if (enabled) {
        addChartButton();
        addInputSentiment();
        Array.from(document.getElementsByClassName('im-mess _im_mess')).forEach(messageElement => {
          const id = messageElement.getAttribute('data-msgid');
          const element = visualisedCache.get(id);
          if (element) {
            if (!enabled) {
              element.style.display = 'inherit';
            }
            return;
          }
          if (!messageCache.has(id)) {
            const text = decodeMessage(messageElement.getElementsByClassName('im-mess--text').item(0));
            const ts = Number(messageElement.getAttribute('data-ts'));
            chrome.runtime.sendMessage({ id, tabId, text, ts }, response => {
              if (response && response.status && response.sentimentalMessage) {
                const value = response.sentimentalMessage.pos;
                messageCache.set(id, value);
                addSentiment(messageElement, id, value);
              } else {
                messageCache.set(id, null);
              }
            });
          } else {
            addSentiment(messageElement, id, messageCache.get(id));
          }
        });
      } else if (enabled) {
        visualisedCache.forEach(element => element.style.display = 'none');
        removeChartButton();
        removeInputSentiment();
      }
      enabled = items.enabled;
    });
  }, 300);
}

function addSentiment(parent, id, value) {
  if (value == null || visualisedCache.has(id)) {
    return;
  }
  const idElement = document.createElement('div');
  idElement.className = 'message-sentiment';
  idElement.style.backgroundColor = getColorForPercentage(value);
  idElement.title = 'Сентимент: ' + (value * 100).toFixed(2) + '%';
  parent.appendChild(idElement);
  visualisedCache.set(id, idElement);
}

function addChartButton() {
  const actionsContainer = document.getElementsByClassName('ui_actions_menu _ui_menu').item(1);
  if (actionsContainer && actionsContainer.children.length && actionsContainer.children.item(0).classList.contains('im-action_chart')) {
    return;
  }
  const action = document.createElement('a');
  action.tabIndex = 0;
  action.role = 'link';
  action.className = 'ui_actions_menu_item _im_action im-action im-action_clear im-action_chart';
  action.textContent = 'История сентиментов';
  action.onclick = () => {
    actionsContainer.parentElement.classList.remove('shown');
    openChart();
  };
  actionsContainer.insertBefore(action, actionsContainer.children.item(0));
}

function removeChartButton() {
  const element = document.getElementsByClassName('im-action_chart').item(0);
  if (element) {
    element.parentElement.removeChild(element);
  }
}

function openChart() {
  const layout = document.createElement('div');
  layout.id = 'chart-layout';
  layout.className = 'sentiment-chart-layout';

  const header = document.createElement('div');
  header.className = 'PopupHeader chart-header';

  const headerText = document.createElement('h2');
  headerText.className = 'PopupHeader__title';
  headerText.textContent = 'История сентиментов';
  header.appendChild(headerText);

  const headerClose = document.createElement('div');
  headerClose.className = 'PopupHeader__close';
  header.appendChild(headerClose);

  const headerCloseButton = document.createElement('button');
  headerCloseButton.className = 'PopupHeader__closeBtn';
  headerCloseButton.onclick = removeChart;
  headerClose.appendChild(headerCloseButton);

  layout.appendChild(header);

  const chartContainer = document.createElement('div');
  chartContainer.id = 'chart';
  layout.appendChild(chartContainer);

  const name = document.getElementsByClassName('im-page--title-main-inner _im_page_peer_name').item(0).textContent;

  chrome.runtime.sendMessage({ tabId, type: 'chart' }, response => {
    if (response && response.own && response.other) {
      const own = response.own.map(value => ({ ...value, own: true }));
      const other = response.other.map(value => ({ ...value, own: false }));
      const values = Array.of(...own, ...other);
      if (values.length === 0) {
        removeChart();
      }
      values.sort((a, b) => a.timestamp - b.timestamp);
      const ownAvg = own.length === 0 ? '0%' : (own.reduce((prev, next) => prev + next.pos, 0) * 100 / own.length).toFixed(2) + '%';
      const otherAvg = other.length === 0 ? '0%' : (other.reduce((prev, next) => prev + next.pos, 0) * 100 / other.length).toFixed(2) + '%';
      document.body.appendChild(layout);

      chart = c3.generate({
        bindto: '#chart',
        data: {
          columns: [
            [`Вы (${ownAvg})`, ...values.map(value => value.own ? value.pos : null)],
            [`${name.split(' ')[0]} (${otherAvg})`, ...values.map(value => !value.own ? value.pos : null)]
          ],
          onclick: (event) => {
            chrome.runtime.sendMessage({ type: 'message', tabId, messageId: values[event.index].messageId }, () => {
              removeChart();
            });
          },
          type: 'line'
        },
        axis: {
          x: {
            padding: { right: values.length < 2 ? 0 : 15 },
            tick: { outer: false, count: 2, format: id => (new Date(values[id].timestamp * 1000)).toLocaleString() }
          },
          y: { min: 0, max: 1, tick: { values: [0, 1], format: x => (x * 100) + '%' } }
        },
        line: {
          connectNull: true
        },
        zoom: {
          enabled: true,
          type: 'scroll'
        },
        tooltip: {
          format: {
            value: value => (value * 100).toFixed(2) + '%'
          }
        },
        area: { zerobased: true },
        onrendered: () => {
          document.addEventListener('click', chartClickListener);
        }
      });
    }
  });
}

const chartClickListener = event => {
  let element = event.target;
  while (element) {
    if (element.id === 'chart' || element.classList.contains('im-action_chart') || element.classList.contains('chart-header')) {
      return;
    }
    element = element.parentElement;
  }
  removeChart();
  document.removeEventListener('click', chartClickListener);
}

function removeChart() {
  if (chart) {
    chart.destroy();
  }
  chart = null;
  Array.from(document.body.children).forEach(element => {
    if (element.id === 'chart-layout') {
      document.body.removeChild(element);
    }
  });
}

const inputListener = event => {
  if (inputSentiment) {
    chrome.runtime.sendMessage({ type: 'online', text: decodeMessage(event.target), tabId }, response => {
      if (response) {
        const value = response.pos;
        inputSentiment.style.backgroundColor = getColorForPercentage(value);
        inputSentiment.title = 'Сентимент ' + (value * 100).toFixed(2) + '%';
      }
    });
  }
}

function addInputSentiment() {
  if (inputSentiment) {
    return;
  }
  const inputContainer = document.getElementsByClassName('im-chat-input--txt-wrap _im_text_wrap').item(0);
  inputSentiment = document.createElement('div');
  inputSentiment.className = 'message-sentiment input-message-sentiment';
  const input = document.getElementsByClassName('im_editable im-chat-input--text _im_text').item(0);
  chrome.runtime.sendMessage({ type: 'online', text: input.textContent, tabId }, response => {
    if (response) {
      const value = response.pos;
      inputSentiment.style.backgroundColor = getColorForPercentage(value);
      inputSentiment.title = 'Сентимент ' + (value * 100).toFixed(2) + '%';
    }
  });
  inputContainer.appendChild(inputSentiment);
  input.addEventListener('input', inputListener);
}

function removeInputSentiment() {
  if (!inputSentiment)
    return;
  const input = document.getElementsByClassName('im_editable im-chat-input--text _im_text').item(0);
  if (input) {
    input.removeEventListener('input', inputListener);
  }
  if (!inputSentiment.parent) {
    inputSentiment = null;
    return;
  }
  inputSentiment.parent.removeChild(inputSentiment);
  inputSentiment = null;
}

function decodeMessage(element) {
  let result = '';
  element.childNodes.forEach(child => result += child.textContent || child.alt || '');
  return result;
}
