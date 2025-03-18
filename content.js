(() => {
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
            console.log("Current Video URL:", window.location.href)
            const url = new URL(window.location.href);
            const bv = url.pathname.split('/')[2]; // 假设路径为 /video/BVxxxxxx
            // 检测视频是否为分P
            let p = 0;
            let title = `[V3]${titleElement.title}`;
            const params = url.searchParams;
            if(params.has("p")){
                p = params.get("p")
                title = `${title}(P${p})`
            }
            
            const currentTime = video.currentTime;
            const duration = video.duration;
            // 进行可能的手动倒带。
            lastSavedTime = video.currentTime;
            // 发送书签信息到 background.js
            const recordTime = Math.floor(Date.now() / 1000)
            const key = `${recordTime}:${bv}:${p}`
            console.log('Content.Js:准备向BackGround.js发送书签信息')
            console.log('Video information:', {recordTime, key, bv, p, title, currentTime, duration});
            chrome.runtime.sendMessage({
                recordTime,
                key: key,
                type: 'STORE_VIDEO_INFO',
                title,
                bv,
                p,
                currentTime,
                duration,
                // 该视频是否需要追踪
                track : true
            });
            addPlayerTracker(video, key)
        }
    })

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
})();

// 下面部分处理视频的播放进度追踪。
// 视频播放的保存起始点，默认只能随视频播放进度增长而不能倒带，必须通过手动点击“+”按钮来人为进行倒带。
let lastSavedTime;
(() => {
    // 新视频打开后，向background.js验证其是否需要追踪。
    const url = new URL(window.location.href);
    const bv = url.pathname.split('/')[2]; // 假设路径为 /video/BVxxxxxx
    // 检测视频是否为分P
    let p = 0;
    const params = url.searchParams;
    if(params.has("p")){
        p = params.get("p")
    }
    // 计算出Key
    const key = `${bv}:${p}`
    chrome.runtime.sendMessage({
        type: 'NEW_VIDEO_OPENED',
        key,
    },(response) => {
        // 如果需要追踪，那么启动追踪协议
        if (response && response.track == true) {
            // 首先设置视频播放位置为记录的时间。
            const video = document.querySelector('video');
            video.currentTime = response.startTime - 5;
            addPlayerTracker(video, key)
        } else {
            console.log("本视频设置为无需追踪进度:", {key})
        }
    });
})();
    

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

// 启动追踪协议。
function addPlayerTracker(video, key){
    console.log("检测到本视频有书签, 开始追踪视频进度:", {key})
    // 记录视频每个上一次进度记录时间。
    lastSavedTime = video.currentTime;
    // TimeUpdate是<video> 或 <audio> 元素自带的一个事件，它会在视频的播放位置发生变化时触发。
    video.addEventListener('timeupdate', () => {
        const currentTime = video.currentTime;
        // 每次视频播放进度跨度达到5S时，触发进度保存消息。
        if (currentTime - lastSavedTime > 5){
            lastSavedTime = currentTime;
            chrome.runtime.sendMessage({
                type: 'UPDATE_VIDEO_PROGRESS',
                key,
                currentTime
            });
        }
    });
}

