import test from "./assets/home_FILL0_wght400_GRAD0_opsz48.png";

chrome.devtools.panels.create(
  "HCI Kit Devtools",
  test,
  "panel.html",
  function (panel) {
    // code invoked on panel creation
    console.log("panel created");
  }
);
