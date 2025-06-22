function capturePageData() {
    const html = document.documentElement.outerHTML;
    const styles = Array.from(document.styleSheets)
        .map(sheet => {
            try {
                return Array.from(sheet.cssRules)
                    .map(rule => rule.cssText)
                    .join('\n');
            } catch (e) {
                return '';
            }
        })
        .join('\n');

    const scripts = Array.from(document.scripts)
        .map(script => script.src ? `// Fetched from: ${script.src}` : script.innerHTML)
        .join("\n");

    return {html, styles, scripts};
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("CAPTURE_SNAPSHOT", {message, sender, sendResponse});

    if (message.type === "CAPTURE_SNAPSHOT") {
        const pageData = capturePageData();
        sendResponse(pageData);
    }
});


