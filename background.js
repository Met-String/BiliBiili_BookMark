chrome.runtime.onInstalled.addListener(() => {
    console.log("Chrome Extension installed！");
});

// background.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'STORE_VIDEO_INFO') {
        const {bv, title, currentTime, track} = message;
        chrome.storage.local.set({[bv] : {currentTime, title, track}}, () => {
            console.log('Video information saved:', {bv, title, currentTime, track});
        });

        // 设置更新专属的绿色badge
        chrome.browserAction.setBadgeText({ text: '更新!' });
        chrome.browserAction.setBadgeBackgroundColor({ color: 'green' });
        // 通过在N秒后设置TEXT为空来移除徽章。
        setTimeout(() => {
            chrome.browserAction.setBadgeText({ text: '' });
        }, 3000);
        sendResponse({status: 'success'});

    // 处理视频跳转的Message请求。
    } else if(message.type =='SKIP_TO_VIDEO'){ //跳转
        const url = message.url
        const currentTime = message.currentTime - 5;

        // 页面加载完成后触发跳转
        chrome.tabs.create({ url },function(tab){
            function handleTabUpdate(tabId, changeInfo, updatedTab) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    // 如果该tab的tabID与新建页面的tabID一致，那么向其发送Message，定位视频播放时间。
                    chrome.tabs.sendMessage(tab.id, { currentTime });
                    // 移除监听器，避免重复添加
                    chrome.tabs.onUpdated.removeListener(handleTabUpdate);
                }
            }
            chrome.tabs.onUpdated.addListener(handleTabUpdate);
        });

    // 处理新视频打开时 检测其是否需要追踪的来自Content.js的Message
    } else if(message.type == 'NEW_VIDEO_OPENED'){
        const bv = message.bv;
        chrome.storage.local.get([bv], (result) => {
            if (result[bv] && result[bv].track === true) {
                // 返回需要追踪的响应
                sendResponse({ track: true, startTime:result[bv].currentTime});
            } else {
                // 返回不需要追踪的响应
                sendResponse({ track: false });
            }
        });
        // 必须返回 true，以便允许异步调用 sendResponse
        return true;

    } else if(message.type == 'UPDATE_VIDEO_PROGRESS'){
        const {bv, currentTime} = message
        chrome.storage.local.get([bv], (result) => {
            if (result[bv]) {
                result[bv].currentTime = currentTime;
                chrome.storage.local.set({ [bv]: result[bv] });
                console.log("视频播放进度更新:", {bv, currentTime});
            }
        });
    }   
});
