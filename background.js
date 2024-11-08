// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//   if (request.type === 'record') {
//     // chrome.storage.local.set({ isRecording: true });
//   } else if (request.type === 'stop') {
//     // chrome.storage.local.set({ isRecording: false });
//   } else if (request.type === 'replay') {
//     chrome.storage.local.get(['recordedSessions'], (result) => {
//       const sessions = result.recordedSessions || [];
//       const lastSession = sessions[sessions.length - 1];
//       replaySession(lastSession);
//     });
//   }
// });

// async function replaySession(session) {
//   console.log('sessio', sessions)
//   for (const action of session.actions) {
//     if (action.type === 'click') {
//       await chrome.scripting.executeScript({
//         target: { tabId: action.tabId },
//         func: () => {
//           const element = document.querySelector(action.selector);
//           if (element) {
//             element.click();
//           }
//         }
//       });
//     } else if (action.type === 'input') {
//       // ... similar for input events
//     } else if (action.type === 'scroll') {
//       // ... similar for scroll events
//     }
//     // ... other event types
//     await new Promise(resolve => setTimeout(resolve, action.delay));
//   }
// }

let isRecording = false;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startRecording") {
    isRecording = true;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('start recording in', tabs)
      let tabId = tabs[0].id;
      sendMessageToContentScript(tabId, { greeting: "Hello from background!" });
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: initializeRecording,
      });
    });
  } else if (message.action === "stopRecording") {
    isRecording = false;
    console.log('stop recording out')
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log('stop recording in', tabs)
      let tabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: stopRecording,
      });
    });
  } else if (message.action === "replaySession") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      let tabId = tabs[0].id;
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        function: replayRecording,
      });
    });
  } else if (message.action === "getStatus") {
    sendResponse({ isRecording });
  } else if(message.action === 'stopRecordingFromBg'){
    console.log('save session', message)
    chrome.storage.local.set({ sessions: message.data });
  } else {
    console.log('else case', message)
  }
});

function initializeRecording() {
  chrome.runtime.sendMessage({ action: "initializeRecording" });
}

function stopRecording() {
  chrome.runtime.sendMessage({ action: "stopRecordingFromBg" });
}

function replayRecording() {
  chrome.runtime.sendMessage({ action: "replayRecording" });
}

function sendMessageToContentScript(tabId, message) {
  chrome.tabs.sendMessage(tabId, message, function(response) {
    console.log("Response from content script:", response);
  });
}
