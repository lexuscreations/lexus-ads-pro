const initialData = {
  isExtensionEnabled: true,
  videosSkipped: {
    today: 0,
    week: 0,
    month: 0,
    total: 0,
  },
};

const MessageTypeEnum = {
  SKIPPED_AD_DATA: "SKIPPED_AD_DATA",
  EXTENSION_STATE_REQUEST: "EXTENSION_STATE_REQUEST",
  EXTENSION_STATE_RESPONSE: "EXTENSION_STATE_RESPONSE",
};

const reloadYoutubeTabs = async ({ matchURlPattern }) => {
  const tabs = await chrome.tabs.query({ url: matchURlPattern });
  tabs.forEach(({ id }) => chrome.tabs.reload(id));
};

const getSecondsFromFormattedDuration = (duration) => {
  const durationArr = duration.split(":");
  return parseInt(durationArr[0]) * 60 + parseInt(durationArr[1]);
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

chrome.runtime.onInstalled.addListener((details) => {
  Promise.all(
    chrome.runtime
      .getManifest()
      .content_scripts.flatMap((script) => script.matches)
      .map((matchURlPattern) => reloadYoutubeTabs({ matchURlPattern }))
  );
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.messageType) {
    if (request.messageType === MessageTypeEnum.SKIPPED_AD_DATA) {
      chrome.storage.local.get(
        ["savedSkippedAdsLogs"],
        ({ savedSkippedAdsLogs }) => {
          savedSkippedAdsLogs = savedSkippedAdsLogs
            ? JSON.parse(savedSkippedAdsLogs)
            : [];

          const timestamp = Date.now();
          let adDurationInSeconds;
          if (!request.skippedAdData.duration) adDurationInSeconds = 0;
          else
            adDurationInSeconds = getSecondsFromFormattedDuration(
              request.skippedAdData.duration
            );
          savedSkippedAdsLogs.push([timestamp, adDurationInSeconds]);
          saveData("savedSkippedAdsLogs", savedSkippedAdsLogs);
        }
      );
    } else if (
      request.messageType === MessageTypeEnum.EXTENSION_STATE_REQUEST
    ) {
      chrome.storage.local.get(["savedData"], ({ savedData }) => {
        if (savedData) savedData = JSON.parse(savedData);
        else {
          savedData = initialData;
          saveData("savedData", savedData);
        }

        chrome.tabs.sendMessage(sender.tab.id, {
          messageType: MessageTypeEnum.EXTENSION_STATE_RESPONSE,
          isExtensionEnabled: savedData.isExtensionEnabled,
        });
      });
    }
  }
  sendResponse();
});
