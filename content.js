const loadButton = async () => {
    console.log('Content script loaded on this page');

    const playerToolbar = document.getElementsByClassName("bpx-player-control-bottom-right")[0];

    const recordButton = document.createElement("img");
    recordButton.src = chrome.runtime.getURL("icons/plussign.png");
    recordButton.style.height = "22px";
    recordButton.role = "button";
    recordButton.tabIndex = "0";
    // recordButton.style.marginRight = "17px";
    recordButton.style.cursor = "Pointer";
    recordButton.style.transform = "scale(0.7)";
    recordButton.style.border = "0 solid transparent";
    recordButton.style.borderWidth = "0px 17px 0px 15px";

    // 添加悬停效果
    recordButton.style.filter = "brightness(0.8)";
    recordButton.addEventListener("mouseover", function() {
        recordButton.style.filter = "brightness(1.2)";
    });
    recordButton.addEventListener("mouseout", function() {
        recordButton.style.filter = "brightness(0.8)";
    });

    recordButton.addEventListener("click", function() {
        const titleElement = document.querySelector('.video-info-title-inner > h1');
        const video = document.querySelector('video');
        const bv = window.location.href.split('/video/')[1].split('/')[0];
        const title = titleElement.title;
        const currentTime = video.currentTime;
        console.log('BV:' + bv);
        console.log('CurrentTime:' + currentTime)
        // 发送消息到 background.js
        chrome.runtime.sendMessage({         
            type: 'STORE_VIDEO_INFO',
            bv: bv,
            title: title,
            currentTime: currentTime
        }, function(response) {
            console.log('Response from background:', response);
        });
    });

    const CheckButtonLoaded = () => {
        // 目标节点
        const targetNode = document.getElementsByClassName("bpx-player-ctrl-quality-result")[0];
        if (targetNode) {
            playerToolbar.insertBefore(recordButton, playerToolbar.firstChild);
        } else {
            // 如果节点还未加载，持续检查
            setTimeout(CheckButtonLoaded,100);
        }
    }
    CheckButtonLoaded();
}

loadButton();

document.addEventListener('DOMContentLoaded', function() {
    
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.currentTime !== undefined) {
        const video = document.querySelector('video');
        if (video) {
            video.currentTime = message.currentTime;  // 设置视频跳转到指定时间
            console.log("Receive TimeStamp:" + message.currentTime)
        }
    }
});


