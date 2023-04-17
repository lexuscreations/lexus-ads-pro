const MessageTypeEnum = {
  SKIPPED_AD_DATA: "SKIPPED_AD_DATA",
  PAGE_RELOAD_REQUEST: "PAGE_RELOAD_REQUEST",
  EXTENSION_STATE_REQUEST: "EXTENSION_STATE_REQUEST",
  EXTENSION_STATE_RESPONSE: "EXTENSION_STATE_RESPONSE",
};

const $ = (selector, all = false) =>
  all ? document.querySelectorAll(selector) : document.querySelector(selector);

const sendSkippedAdData = (skippedAdData) =>
  chrome.runtime.sendMessage({
    messageType: MessageTypeEnum.SKIPPED_AD_DATA,
    skippedAdData,
  });

const requestExtensionState = () =>
  chrome.runtime.sendMessage({
    messageType: MessageTypeEnum.EXTENSION_STATE_REQUEST,
  });

const handleSkipAd = (durationType, secondsSkipped) => {
  const videoPlayer = document.getElementsByClassName("video-stream")[0];
  if (videoPlayer?.duration) videoPlayer.currentTime = videoPlayer.duration;
  $(".ytp-ad-skip-button")?.click();
  sendSkippedAdData({ secondsSkipped, duration: durationType });
};

const handleAd = (resolve) => {
  const videoContainer = document.getElementById("movie_player");
  const isAd = videoContainer?.classList.contains("ad-interrupting");
  const secondsSkipped = $(".ytp-ad-preview-text")?.innerText;

  if (isAd && secondsSkipped) {
    [
      $(".ytp-time-duration")?.innerText,
      document.getElementById("ad-text:i")?.innerText,
    ].forEach((e) => e !== "0:00" && handleSkipAd(e, secondsSkipped));
  }

  document.hideElementsBySelectors([
    ".ytd-companion-slot-renderer",
    ".ytd-watch-next-secondary-results-renderer.sparkles-light-cta",
    ".ytd-unlimited-offer-module-renderer",
    ".ytp-ad-overlay-image",
    ".ytp-ad-text-overlay",
    ".ytd-display-ad-renderer",
    ".ytd-statement-banner-renderer",
    ".ytd-banner-promo-renderer",
    ".ytd-video-masthead-ad-v3-renderer",
    ".ytd-primetime-promo-renderer",
  ]);

  resolve();
};

const keepLooping = async () => {
  while (true)
    await new Promise((resolve) => setTimeout(() => handleAd(resolve), 100));
};

(async () => {
  Document.prototype.hideElementsBySelectors = (selectors) =>
    selectors.forEach((selector) =>
      [...$(selector, true)].forEach((el) => (el.style.display = "none"))
    );

  requestExtensionState();

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request?.messageType === MessageTypeEnum.PAGE_RELOAD_REQUEST) {
      alert(
        `Youtube Ad Blocker is turned ${
          request.isExtensionEnabled ? "on" : "off"
        }. Every Youtube tab is going to be reloaded in order for the extension to work properly.`
      );
      location.reload();
    } else if (
      request?.messageType === MessageTypeEnum.EXTENSION_STATE_RESPONSE &&
      request.isExtensionEnabled
    )
      keepLooping();
  });
})();
