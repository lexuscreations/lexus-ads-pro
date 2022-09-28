setInterval(() => {
  let ytMdiaPlyScrnEleDivSec = document.querySelector("#player-container-outer.style-scope.ytd-watch-flexy")
  if (ytMdiaPlyScrnEleDivSec != undefined) {
    if (document.querySelector(".lexusVideoTopStatusAppIndicator") == undefined) {
      let lexusStatusIndicatorElement = document.createElement("h2")
      lexusStatusIndicatorElement.textContent = `LexusAdSkipper: Activated`
      lexusStatusIndicatorElement.classList.add("lexusVideoTopStatusAppIndicator")
      ytMdiaPlyScrnEleDivSec.prepend(lexusStatusIndicatorElement)
    }
  }
  let skipButtonLexusVideo = document.getElementsByClassName("ytp-ad-skip-button")
  let skipButtonLexusTextAd = document.getElementsByClassName("ytp-ad-overlay-close-button")
  if (skipButtonLexusVideo != undefined && skipButtonLexusVideo.length > 0) {
    console.log("LexusAdSkipper: VideoAdSkipped")
    skipButtonLexusVideo[0].click()
  }
  if (skipButtonLexusTextAd != undefined && skipButtonLexusTextAd.length > 0) {
    console.log("LexusAdSkipper: TextAdSkipped")
    skipButtonLexusTextAd[0].click()
  }
}, 3000)
