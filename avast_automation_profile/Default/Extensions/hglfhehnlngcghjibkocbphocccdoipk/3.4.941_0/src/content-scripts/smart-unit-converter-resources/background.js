/**
 * Smart Unit Converter - Background Script
 * Handles the state of the Smart Unit Converter
 */

// Track the current state of the Smart Unit Converter
let isSmartUnitConverterEnabled = false;

// Initialize the state from storage
chrome.storage.local.get(["smartUnitConverterEnabled"], function (result) {
  isSmartUnitConverterEnabled = result.smartUnitConverterEnabled || false;
  console.log(
    "Smart Unit Converter initialized with state:",
    isSmartUnitConverterEnabled,
  );
});

// Listen for messages from the UI or content script
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "toggleSmartUnitConverter") {
    isSmartUnitConverterEnabled = message.enabled;
    console.log(
      "Smart Unit Converter state updated:",
      isSmartUnitConverterEnabled,
    );

    // Notify all tabs about the state change
    chrome.tabs.query({}, function (tabs) {
      tabs.forEach(function (tab) {
        if (
          tab.id &&
          (tab.url?.startsWith("http://") || tab.url?.startsWith("https://"))
        ) {
          chrome.tabs
            .sendMessage(tab.id, {
              action: "smartUnitConverterStateChanged",
              enabled: isSmartUnitConverterEnabled,
            })
            .catch(() => {
              // Ignore errors when content script is not loaded in some tabs
            });
        }
      });
    });
  } else if (message.action === "smartUnitConverterInjected") {
    console.log(
      "Smart Unit Converter content script injected in tab:",
      sender.tab?.id,
    );

    // Send current state to the content script that just loaded
    if (sender.tab?.id) {
      chrome.tabs.sendMessage(sender.tab.id, {
        action: "smartUnitConverterStateChanged",
        enabled: isSmartUnitConverterEnabled,
      });
    }
  } else if (message.action === "currenciesFound") {
    console.log("Currencies found in tab:", sender.tab?.id, message.currencies);
    // Here we could store or further process the found currencies
  }
});

// Export the module
export default {
  // Could export functionality here if needed by other modules
};
