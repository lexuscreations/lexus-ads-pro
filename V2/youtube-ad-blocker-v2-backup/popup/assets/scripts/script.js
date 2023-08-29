const dayLength = 86400000; // 24 * 60 * 60 * 1000;

const MessageTypeEnum = {
  UPDATE_PLAY_SPEED: "UPDATE_PLAY_SPEED",
  PAGE_RELOAD_REQUEST: "PAGE_RELOAD_REQUEST",
  REQUEST_PICTURE_IN_PLAY: "REQUEST_PICTURE_IN_PLAY",
};

const initialData = {
  isExtensionEnabled: true,
  plackSpeed: "1",
  videosSkipped: {
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  },
};

const $ = (selector, all = false) =>
  all ? document.querySelectorAll(selector) : document.querySelector(selector);

const getFirstDayOfWeek = (date) => {
  const currentWeekDayMillisecond = date.getDay() * dayLength;
  let monday = new Date(date.getTime() - currentWeekDayMillisecond + dayLength);
  if (monday > date) monday = new Date(monday.getTime() - dayLength * 7);
  return monday;
};

const getTimestamps = () => {
  const now = Date.now();
  const today = now - (now % dayLength);
  const firstDayOfWeek = getFirstDayOfWeek(new Date(now)).getTime();
  const firstDayOfMonth = new Date(
    new Date(now).getFullYear(),
    new Date(now).getMonth(),
    1
  ).getTime();
  return { today, firstDayOfWeek, firstDayOfMonth };
};

const saveData = (key, data) => {
  try {
    if (!data || typeof data !== "object")
      throw new Error("Invalid data format");
    chrome.storage.local.set({ [key]: JSON.stringify(data) });
  } catch (error) {
    console.error(`Error saving data: ${error.message}`);
  }
};

const askAllYoutubeTabsToReload = (isExtensionEnabled) => {
  chrome.tabs.query({ url: "https://www.youtube.com/*" }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.tabs.sendMessage(tab.id, {
        messageType: MessageTypeEnum.PAGE_RELOAD_REQUEST,
        isExtensionEnabled,
      });
    });
  });
};

const getStats = (skippedAdsLogs) => {
  const { today, firstDayOfWeek, firstDayOfMonth } = getTimestamps();
  let videosSkippedToday = 0;
  let videosSkippedWeek = 0;
  let videosSkippedMonth = 0;

  for (let i = 0; i < skippedAdsLogs.length; i++) {
    const [adTimestamp] = skippedAdsLogs[i];
    if (today <= adTimestamp) {
      videosSkippedToday++;
    } else if (firstDayOfWeek <= adTimestamp) {
      videosSkippedWeek++;
    } else if (firstDayOfMonth <= adTimestamp) {
      videosSkippedMonth++;
    }
  }

  const videosSkippedTotal = skippedAdsLogs.length;

  videosSkippedWeek += videosSkippedToday;
  videosSkippedMonth += videosSkippedWeek;

  return {
    videosSkipped: {
      today: videosSkippedToday,
      week: videosSkippedWeek,
      month: videosSkippedMonth,
      total: videosSkippedTotal,
    },
  };
};

const updateUI = (data) => {
  $("#total-count").innerText = data.videosSkipped.total;
  $("#today-count").innerText = data.videosSkipped.today;
  $("#this-week-count").innerText = data.videosSkipped.week;
  $("#this-month-count").innerText = data.videosSkipped.month;
  $("#isExtensionEnabledCb").checked = data.isExtensionEnabled;
  $("#more-controls-playSpeed-select").value = data.plackSpeed;
};

const main = () => {
  let data = initialData;
  let skippedAdsLogs = [];

  chrome.storage.local.get(
    ["savedData", "savedSkippedAdsLogs"],
    ({ savedData, savedSkippedAdsLogs }) => {
      if (savedData) data = JSON.parse(savedData);
      if (savedSkippedAdsLogs) skippedAdsLogs = JSON.parse(savedSkippedAdsLogs);
      else saveData("savedSkippedAdsLogs", skippedAdsLogs);

      const { videosSkipped } = getStats(skippedAdsLogs);
      data.videosSkipped = videosSkipped;
      if (!data.plackSpeed) data.plackSpeed = initialData.plackSpeed;
      saveData("savedData", data);
      updateUI(data);
    }
  );

  $("#isExtensionEnabledCb").addEventListener("change", ({ target }) => {
    data.isExtensionEnabled = target.checked;
    updateUI(data);
    saveData("savedData", data);
    askAllYoutubeTabsToReload(target.checked);
  });

  $("#pictureInPlay").addEventListener("click", function () {
    this.classList.add("active");
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        messageType: MessageTypeEnum.REQUEST_PICTURE_IN_PLAY,
      });
    });
  });

  $("#more-controls-playSpeed-select").addEventListener(
    "change",
    ({ target }) => {
      data.plackSpeed = target.value;
      updateUI(data);
      saveData("savedData", data);
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
          messageType: MessageTypeEnum.UPDATE_PLAY_SPEED,
          requestedSpeed: target.value,
        });
      });
    }
  );
};

window.addEventListener("load", main);
