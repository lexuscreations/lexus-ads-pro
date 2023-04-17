const MessageTypeEnum={SKIPPED_AD_DATA:"SKIPPED_AD_DATA",PAGE_RELOAD_REQUEST:"PAGE_RELOAD_REQUEST",EXTENSION_STATE_REQUEST:"EXTENSION_STATE_REQUEST",EXTENSION_STATE_RESPONSE:"EXTENSION_STATE_RESPONSE",REQUEST_PICTURE_IN_PLAY:"REQUEST_PICTURE_IN_PLAY",UPDATE_PLAY_SPEED:"UPDATE_PLAY_SPEED"},$=(e,t=!1)=>t?document.querySelectorAll(e):document.querySelector(e),sendSkippedAdData=e=>chrome.runtime.sendMessage({messageType:MessageTypeEnum.SKIPPED_AD_DATA,skippedAdData:e}),requestExtensionState=()=>chrome.runtime.sendMessage({messageType:MessageTypeEnum.EXTENSION_STATE_REQUEST}),handleSkipAd=(e,t)=>{const n=document.getElementsByClassName("video-stream")[0];n&&n.duration&&(n.currentTime=n.duration);const s=$(".ytp-ad-skip-button");s&&s.click(),sendSkippedAdData({secondsSkipped:t,duration:e})},handleAd=e=>{const t=document.getElementById("movie_player");let n=!1;t&&t.classList&&(n=t.classList.contains("ad-interrupting"));const s=$(".ytp-ad-preview-text");let r="";if(s&&(r=s.innerText),n&&r){const e=[],t=$(".ytp-time-duration");t&&e.push(t.innerText);const n=document.getElementById("ad-text:i");n&&e.push(n.innerText),e.forEach(e=>"0:00"!==e&&handleSkipAd(e,r))}document.hideElementsBySelectors([".ytd-companion-slot-renderer",".ytd-watch-next-secondary-results-renderer.sparkles-light-cta",".ytd-unlimited-offer-module-renderer",".ytp-ad-overlay-image",".ytp-ad-text-overlay",".ytd-display-ad-renderer",".ytd-statement-banner-renderer",".ytd-banner-promo-renderer",".ytd-video-masthead-ad-v3-renderer",".ytd-primetime-promo-renderer"]),e()},keepLooping=async()=>{for(;;)await new Promise(e=>setTimeout(()=>handleAd(e),100))},requestPictureInPlay=async()=>{const e=$("video.video-stream.html5-main-video");if(e)try{await e.requestPictureInPicture()}catch(e){console.error(`Error enabling pictureInPlay: ${e.message}`)}},requestUpdatePlaySpeed=e=>{const t=$("video.video-stream.html5-main-video");t&&(t.playbackRate=parseFloat(e))};(async()=>{Document.prototype.hideElementsBySelectors=(e=>e.forEach(e=>[...$(e,!0)].forEach(e=>e.style.display="none"))),requestExtensionState(),chrome.runtime.onMessage.addListener((e,t,n)=>{e.messageType&&(e.messageType===MessageTypeEnum.UPDATE_PLAY_SPEED?requestUpdatePlaySpeed(e.requestedSpeed):e.messageType===MessageTypeEnum.REQUEST_PICTURE_IN_PLAY?requestPictureInPlay():e.messageType===MessageTypeEnum.PAGE_RELOAD_REQUEST?(alert(`Youtube Ad Blocker is turned ${e.isExtensionEnabled?"on":"off"}. Every Youtube tab is going to be reloaded in order for the extension to work properly.`),location.reload()):e.messageType===MessageTypeEnum.EXTENSION_STATE_RESPONSE&&e.isExtensionEnabled&&keepLooping())})})();