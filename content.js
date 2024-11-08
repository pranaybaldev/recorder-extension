// chrome.runtime.sendMessage({ type: 'checkRecording' });

// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   console.log('req', request)
//   if (request.isRecording) {
//     window.addEventListener('click', (event) => {
//       const target = event.target;
//       const selector = getTargetSelector(target);
//       chrome.runtime.sendMessage({ type: 'click', tabId: chrome.runtime.id, selector: selector });
//     });
//     // Add listeners for other interactions (e.g., input, scroll, navigation)
//   }
// });

// function getTargetSelector(target) {
//   // Implement a robust selector generation algorithm
//   let selectors = [];

//   // Use ID selector if available and unique
//   if (target.id) {
//     selectors.push(`#${target.id}`);
//   }

//   // Use class selectors
//   const classes = target.classList;
//   if (classes.length > 0) {
//     selectors.push(`.${classes.value}`);
//   }

//   // Use tag name as a fallback
//   selectors.push(target.tagName.toLowerCase());

//   // Combine selectors using the most specific first
//   return selectors.join(' ');
// }

let recording = false;
let actions = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('content', message)
  sendResponse({ reply: "Hello from content script!" });
  if (message.action === "initializeRecording") {
    console.log('content ini record')
    recording = true;
    actions = [];
  } else if (message.action === "stopRecordingFromBg") {
    recording = false;
    console.log('content stop record')
    chrome.runtime.sendMessage({ action: "saveSession", data: actions });
  } else if (message.action === "replayRecording") {
    replayActions(actions);
  }
  console.log('actions', actions)
});

function recordAction(event) {
  if (!recording) return;
  const action = {
    type: event.type,
    target: event.target.tagName,
    timestamp: Date.now(),
    value: event.target.value || null,
    scroll: {
      x: window.scrollX,
      y: window.scrollY
    }
  };
  actions.push(action);
}

document.addEventListener("click", recordAction);
document.addEventListener("input", recordAction);
document.addEventListener("scroll", recordAction);

function replayActions(actions) {
  actions.forEach((action) => {
    setTimeout(() => {
      if (action.type === "click") document.querySelector(action.target).click();
      if (action.type === "input") document.querySelector(action.target).value = action.value;
      if (action.type === "scroll") window.scrollTo(action.scroll.x, action.scroll.y);
    }, action.timestamp - actions[0].timestamp);
  });
}
