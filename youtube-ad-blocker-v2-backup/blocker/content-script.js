const MessageTypeEnum = {
  SKIPPED_AD_DATA: "SKIPPED_AD_DATA",
  UPDATE_PLAY_SPEED: "UPDATE_PLAY_SPEED",
  PAGE_RELOAD_REQUEST: "PAGE_RELOAD_REQUEST",
  REQUEST_PICTURE_IN_PLAY: "REQUEST_PICTURE_IN_PLAY",
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
  if (videoPlayer && videoPlayer.duration)
    videoPlayer.currentTime = videoPlayer.duration;
  const skipBtn = $(".ytp-ad-skip-button");
  if (skipBtn) skipBtn.click();
  sendSkippedAdData({ secondsSkipped, duration: durationType });
};

const handleAd = (resolve) => {
  const videoContainer = document.getElementById("movie_player");
  let isAd = false;
  if (videoContainer && videoContainer.classList)
    isAd = videoContainer.classList.contains("ad-interrupting");
  const ad_preview_text_el = $(".ytp-ad-preview-text");
  let secondsSkipped = "";
  if (ad_preview_text_el) secondsSkipped = ad_preview_text_el.innerText;

  if (isAd && secondsSkipped) {
    const arrEl = [];
    const time_duration_el = $(".ytp-time-duration");
    if (time_duration_el) arrEl.push(time_duration_el.innerText);
    const ad_text_i = document.getElementById("ad-text:i");
    if (ad_text_i) arrEl.push(ad_text_i.innerText);
    arrEl.forEach((e) => e !== "0:00" && handleSkipAd(e, secondsSkipped));
  }

  const promo_premium_banner = document.querySelector(
    ".style-scope.yt-mealbar-promo-renderer .button-container.style-scope.yt-mealbar-promo-renderer .yt-spec-button-shape-next.yt-spec-button-shape-next--text.yt-spec-button-shape-next--mono.yt-spec-button-shape-next--size-m"
  );
  if (promo_premium_banner && "click" in promo_premium_banner)
    promo_premium_banner.click();

  document.hideElementsBySelectors([
    ".ytp-ad-text-overlay",
    ".ytp-ad-overlay-image",
    ".ytd-display-ad-renderer",
    ".ytd-banner-promo-renderer",
    ".ytd-companion-slot-renderer",
    ".ytd-primetime-promo-renderer",
    ".ytd-statement-banner-renderer",
    ".ytd-video-masthead-ad-v3-renderer",
    ".ytd-unlimited-offer-module-renderer",
    ".ytd-watch-next-secondary-results-renderer.sparkles-light-cta",
  ]);

  resolve();
};

const keepLooping = async () => {
  while (true)
    await new Promise((resolve) => setTimeout(() => handleAd(resolve), 100));
};

const requestPictureInPlay = async () => {
  const videoEl = $("video.video-stream.html5-main-video");
  if (!videoEl) return;
  try {
    await videoEl.requestPictureInPicture();
  } catch (error) {
    console.error(`Error enabling pictureInPlay: ${error.message}`);
  }
};

const requestUpdatePlaySpeed = (requestedSpeed) => {
  const videoEl = $("video.video-stream.html5-main-video");
  if (!videoEl) return;
  videoEl.playbackRate = parseFloat(requestedSpeed);
};

(async () => {
  Document.prototype.hideElementsBySelectors = (selectors) =>
    selectors.forEach((selector) =>
      [...$(selector, true)].forEach((el) => (el.style.display = "none"))
    );

  requestExtensionState();

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (!message.messageType) return;
    if (message.messageType === MessageTypeEnum.UPDATE_PLAY_SPEED) {
      requestUpdatePlaySpeed(message.requestedSpeed);
    } else if (
      message.messageType === MessageTypeEnum.REQUEST_PICTURE_IN_PLAY
    ) {
      requestPictureInPlay();
    } else if (message.messageType === MessageTypeEnum.PAGE_RELOAD_REQUEST) {
      alert(
        `The status of the Youtube Ad Blocker is currently set to ${
          message.isExtensionEnabled ? "on" : "off"
        }. To ensure the extension functions work properly, all Youtube tabs will be reloaded.`
      );
      location.reload();
    } else if (
      message.messageType === MessageTypeEnum.EXTENSION_STATE_RESPONSE &&
      message.isExtensionEnabled
    )
      keepLooping();
  });
})();
