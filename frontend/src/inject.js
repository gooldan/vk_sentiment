let messageCache = new Map();
let tabId = null;
const visualisedCache = new Map();
let timer = null;
let enabled = null;
let chart = null;

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
        addChartButton();
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
            chrome.runtime.sendMessage({ id, tabId }, response => {
              if (response && response.status && response.sentimentalMessage) {
                const value = response.sentimentalMessage.pos;
                messageCache.set(id, value);
                addSentiment(messageElement, id, value);
              }
            });
          } else {
            addSentiment(messageElement, id, messageCache.get(id));
          }
        });
      } else if (enabled) {
        visualisedCache.forEach(element => element.style.display = 'none');
        removeChartButton();
      }
      enabled = items.enabled;
    });
  }, 50);
}

function addSentiment(parent, id, value) {
  const idElement = document.createElement('div');
  idElement.className = 'message-sentiment';
  idElement.style.backgroundColor = getColorForPercentage(value);
  idElement.title = 'Test';
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
  action.textContent = 'Открыть статистику';
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
  header.className = 'chart-header';
  header.textContent = 'Test';
  layout.appendChild(header);

  const chartContainer = document.createElement('div');
  chartContainer.id = 'chart';
  layout.appendChild(chartContainer);

  document.body.appendChild(layout);

  chart = c3.generate({
    bindto: '#chart',
    data: {
      x: 'x',
      columns: [
        ['x', 1, 2, 5, 7, 8, 9],
        ['Sentiment', 30, 200, 100, 400, 150, 250],
      ],
    },
    axis: {
      y: { show: false }
    },
    legend: {
      hide: true
    },
    onrendered: () => {
      document.addEventListener('click', chartClickListener);
    }
  });
}

const chartClickListener = event => {
  let element = event.target;
  while (element) {
    if (element.id === 'chart' || element.classList.contains('im-action_chart')) {
      return;
    }
    element = element.parentElement;
  }
  chart.destroy();
  chart = null;
  Array.from(document.body.children).forEach(element => {
    if (element.id === 'chart-layout') {
      document.body.removeChild(element);
    }
  });
  document.removeEventListener('click', chartClickListener);
}
