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


chrome.runtime.onMessage.addListener((message, sender, cb) => {
    if (message.type === "CAPTURE_BROWSER_SNAPSHOT") {
        const pageData = capturePageData();
        cb(pageData);
    }
    return true;
});


