document.getElementById("extractBtn").addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_ARTICLE" }, async (response) => {
    if (chrome.runtime.lastError) {
      console.error("Make sure you are on an X page and refresh the tab.", chrome.runtime.lastError);
      return;
    }

    if (response && response.success) {
      console.log("Extraction Successful! Sending to backend...");
      
      try {
        // Send the payload to your local Node server
        const res = await fetch('http://localhost:3000/generate-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(response.data)
        });

        if (!res.ok) throw new Error('Failed to generate PDF on the server.');

        // Convert the response to a blob (a file-like object)
        const blob = await res.blob();
        
        // Create a temporary link to download the file directly in the browser
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `X_Article_${response.data.author.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        
        // Clean up
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
        console.log("Download complete!");

      } catch (err) {
        console.error("Error communicating with backend:", err);
      }

    } else {
      console.error("Extraction failed or no content found.");
    }
  });
});