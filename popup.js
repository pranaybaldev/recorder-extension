// document.getElementById('start').addEventListener('click', () => {
//   chrome.runtime.sendMessage({ type: 'record' });
//   toggleButtons(true);
// });

// document.getElementById('stop').addEventListener('click', () => {
//   chrome.runtime.sendMessage({ type: 'stop' });
//   toggleButtons(false);
// });

// document.getElementById('replay').addEventListener('click', () => {
//   chrome.runtime.sendMessage({ type: 'replay' });
//   toggleButtons(false)
// });
document.getElementById("start").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "startRecording" });
  toggleButtons(true);
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stopRecording" });
  toggleButtons(false);
  // displaySessions();
});

document.getElementById("replay").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "replaySession" });
});

function toggleButtons(isRecording) {
  document.getElementById("start").disabled = isRecording;
  document.getElementById("stop").disabled = !isRecording;
  document.getElementById("replay").disabled = isRecording;
}

function displaySessions() {
  chrome.storage.local.get(["sessions"], ({ sessions }) => {
    const sessionList = document.getElementById("session-list");
    console.log('sessions', sessions)
    if(sessions && sessions.length){
      sessionList.innerHTML = sessions
      .map((session, index) => `<li>Session ${index + 1}</li>`)
      .join("");
    }
    
  });
}

// // Initialize UI based on the current recording state
chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
  toggleButtons(response.isRecording);
});
