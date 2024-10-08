const loadButton = () => {
    console.log('Content script loaded on this page');
    const playerToolbar = document.querySelector(".bpx-player-control-bottom-right");
    const recordButton = document.createElement("img");
    recordButton.src = chrome.runtime.getURL("icons/plussign.png");

    recordButton.style.cursor = "Pointer";
    recordButton.style.height = "22px";
    recordButton.style.border = "0 solid transparent";
    recordButton.style.borderWidth = "0px 17px 0px 15px";
    recordButton.style.transform = "scale(0.7)";
    recordButton.style.filter = "brightness(0.8)"; 

    // 悬停效果
    recordButton.addEventListener("mouseover", () => {
        recordButton.style.filter = "brightness(1.2)";
    });
    recordButton.addEventListener("mouseout", () => {
        recordButton.style.filter = "brightness(0.8)";
    });

    // 点击以添加书签
    recordButton.addEventListener("click", () => {
        const titleElement = document.querySelector('.video-info-title-inner > h1');
        const video = document.querySelector('video');
        if (titleElement && video){
            const bv = window.location.href.split('/video/')[1].split('/')[0];
            const title = titleElement.title;
            const currentTime = video.currentTime;
            // 发送书签信息到 background.js
            chrome.runtime.sendMessage({         
                type: 'STORE_VIDEO_INFO',
                bv,
                title,
                currentTime
            });
        }
    });

    // 在其它官方Toolbar按钮加载后再加载本按钮，防止出现提前加载的违和感。
    const CheckButtonLoaded = () => {
        // 监控目标是调整视频分辨率的按钮
        const targetNode = document.querySelector(".bpx-player-ctrl-quality-result");
        if (targetNode) {
            playerToolbar.insertBefore(recordButton, playerToolbar.firstChild);
        } else {
            // 如果节点还未加载，持续检查
            setTimeout(CheckButtonLoaded, 100);
        }
    }
    CheckButtonLoaded();
}

loadButton();

// 在监听到跳转消息时修改当前页面视频时间戳
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.currentTime !== undefined) {
        const video = document.querySelector('video');
        if (video) {
            video.currentTime = message.currentTime;  // 设置视频跳转到指定时间
            console.log("Receive TimeStamp:" + message.currentTime)
        }
    }
});


