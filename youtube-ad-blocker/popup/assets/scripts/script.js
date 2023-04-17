const dayLength = 86400000; // 24 * 60 * 60 * 1000;

const MessageTypeEnum = {
  SKIPPED_AD_DATA: "SKIPPED_AD_DATA",
  PAGE_RELOAD_REQUEST: "PAGE_RELOAD_REQUEST",
  EXTENSION_STATE_REQUEST: "EXTENSION_STATE_REQUEST",
  EXTENSION_STATE_RESPONSE: "EXTENSION_STATE_RESPONSE",
};

const ItemsEnum = {
  VIDEOS_SKIPPED: "VIDEOS_SKIPPED",
};

const initialData = {
  isExtensionEnabled: true,
  itemsShown: ItemsEnum.VIDEOS_SKIPPED,
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
  $("#isExtensionEnabledCb").checked = data.isExtensionEnabled;
  $("#total-count").innerText = data.videosSkipped.total;
  $("#today-count").innerText = data.videosSkipped.today;
  $("#this-week-count").innerText = data.videosSkipped.week;
  $("#this-month-count").innerText = data.videosSkipped.month;
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
};

window.addEventListener("load", main);
