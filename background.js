chrome.runtime.onInstalled.addListener(() => {
    console.log("Chrome Extension installed！");
});

// background.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'STORE_VIDEO_INFO') {
        const {bv, title, currentTime} = message;
        chrome.storage.local.set({[bv] : {currentTime, title}}, () => {
            console.log('Video information saved:', {bv, title, currentTime});
        });

        // 设置 badge
        chrome.browserAction.setBadgeText({ text: '更新!' });
        chrome.browserAction.setBadgeBackgroundColor({ color: 'green' });
        setTimeout(() => {
            chrome.browserAction.setBadgeText({ text: '' });
        }, 3000);

        sendResponse({status: 'success'});

    } else if(message.type =='SKIP_TO_VIDEO'){ //跳转
        const {url, currentTime} = message;
        // 页面加载完成后触发跳转
        chrome.tabs.create({ url },function(tab){
            function handleTabUpdate(tabId, changeInfo, updatedTab) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    chrome.tabs.sendMessage(tab.id, { currentTime });
                    // 移除监听器，避免重复添加
                    chrome.tabs.onUpdated.removeListener(handleTabUpdate);
                }
            }
            chrome.tabs.onUpdated.addListener(handleTabUpdate);
        });
    }
});
