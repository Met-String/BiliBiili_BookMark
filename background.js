chrome.runtime.onInstalled.addListener(() => {
    console.log("My Chrome Extension installed!");
});

// background.js
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'STORE_VIDEO_INFO') {
        // 处理接收到的信息
        const bv = message.bv;
        const title = message.title;
        const currentTime = message.currentTime;

        console.log('Received BV ID:', bv);
        console.log('Received Current Time:', currentTime);

        // 在这里可以把信息存储起来，例如存储在 chrome.storage 中
        chrome.storage.local.set({[bv] : {currentTime: currentTime, title: title}}, function() {
            console.log('Video information saved.');
        });

        chrome.storage.local.get(null, function(items) {
            console.log('All stored items:', items);
            // 在这里可以对 items 对象进行各种处理
            for (let key in items) {
                console.log(`Key: ${key}，title:${items[key]['title']}，currentTime: ${items[key]['currentTime']}`);
            }
        });
        // 发送回应给 content.js
        console.log("wwwwwww!!!")
        // // 设置 badge 文本
        chrome.browserAction.setBadgeText({ text: '更新!' });
        // // 设置 badge 背景颜色
        chrome.browserAction.setBadgeBackgroundColor({ color: 'green' }); // 红色背景
        // 3 秒后清除 badge
        setTimeout(() => {
            chrome.browserAction.setBadgeText({ text: '' }); // 清空 badge
        }, 3000);

        sendResponse({status: 'success'});

    } else if(message.type =='SKIP_TO_VIDEO'){
        const url = message.url;
        const currentTime = message.currentTime;
        console.log("Receive VIDEO_SKIP Message!")
        chrome.tabs.create({ url: url },function(tab){
            function handleTabUpdate(tabId, changeInfo, updatedTab) {
                if (tabId === tab.id && changeInfo.status === 'complete') {
                    // 页面加载完成后发送消息
                    chrome.tabs.sendMessage(tab.id, { currentTime: currentTime });
                    console.log("已经发送！");
                    // 移除监听器，避免重复添加
                    chrome.tabs.onUpdated.removeListener(handleTabUpdate);
                }
            }
            chrome.tabs.onUpdated.addListener(handleTabUpdate);
        });
    }
});
