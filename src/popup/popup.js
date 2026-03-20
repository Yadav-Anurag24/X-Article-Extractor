document.getElementById("extractBtn").addEventListener("click", async () => {
  // Get the current active tab
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Send a message to the scraper script injected into that tab
  chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_ARTICLE" }, (response) => {
    if (chrome.runtime.lastError) {
      console.error("Make sure you are on an X page and refresh the tab.", chrome.runtime.lastError);
      return;
    }

    if (response && response.success) {
      console.log("Extraction Successful!");
      console.log("Payload ready for backend:", response.data);
      // We will add the API call to your Node.js backend here later
    } else {
      console.error("Extraction failed or no content found.");
    }
  });
});