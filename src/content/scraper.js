// Helper function to clean up raw scraped text
function cleanArticleText(rawText) {
  const lines = rawText.split('\n');
  
  const cleanedLines = lines.filter(line => {
    const t = line.trim();
    if (t === '') return false; // Remove empty lines
    
    // Remove common X UI buttons
    const stopWords = ['Subscribe', 'Share', 'Post', 'View quotes', 'Repost'];
    if (stopWords.includes(t)) return false;
    
    // Remove engagement metrics (e.g., "1K", "4.4K", "9.1M", "500")
    if (/^[0-9]+(\.[0-9]+)?[KMB]?$/.test(t)) return false;
    
    // Remove isolated @ handles
    if (t.startsWith('@') && t.split(' ').length === 1) return false;
    
    return true; // Keep everything else (the actual text)
  });
  
  // Join the good lines back together with double spacing for readability
  return cleanedLines.join('\n\n');
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "EXTRACT_ARTICLE") {
    try {
      let extractedText = "";

      const tweetElements = document.querySelectorAll('[data-testid="tweetText"]');
      
      if (tweetElements.length > 0) {
        tweetElements.forEach((el) => {
          extractedText += el.innerText + "\n\n";
        });
      } else {
        const articleContainer = document.querySelector('article');
        if (articleContainer) {
          extractedText = articleContainer.innerText;
        } else {
          throw new Error("Could not find any readable content.");
        }
      }

      // Run the raw text through our new cleaner
      const finalCleanText = cleanArticleText(extractedText);

      const authorElement = document.querySelector('[data-testid="User-Name"]');
      const author = authorElement ? authorElement.innerText.replace(/\n/g, ' ') : "Unknown Author";

      const payload = {
        author: author,
        url: window.location.href,
        content: finalCleanText
      };

      sendResponse({ success: true, data: payload });
    } catch (error) {
      console.error("Scraper Error:", error);
      sendResponse({ success: false, error: error.message });
    }
  }
  return true; 
});