document.addEventListener('DOMContentLoaded', function() {
    // 获取要展示列表的 DOM 元素
    const videoList = document.getElementById('videoList');

    // 从 chrome.storage.local 获取存储的 BV 号和时间
    chrome.storage.local.get(null, function(items) {
        // 遍历存储的每个键值对
        for (let key in items) {
            if (items.hasOwnProperty(key)) {
                const videoItem = items[key];

                // 创建列表项
                let li = document.createElement('li');
                li.className = 'videoItem';
    
                // 创建时间戳元素
                let TitleAndTime = document.createElement('span');
                TitleAndTime.className = "TitleAndTime";
                const seconds = Math.floor(videoItem.currentTime % 60);;
                const minutes = Math.floor(videoItem.currentTime % 3600 / 60);
                const hours = Math.floor(videoItem.currentTime / 3600);
                TitleAndTime.innerHTML = `${videoItem.title}<br>${hours}:${minutes}:${seconds}`;

                // 创建删除按钮
                let deleteButton = document.createElement('button');
                deleteButton.style = "height: 30px";
                deleteButton.textContent = '删除';
                deleteButton.addEventListener('click', function() {
                    // 点击删除按钮时，从 chrome.storage.local 中删除该条目
                    chrome.storage.local.remove(key, function() {
                        li.remove();  // 从界面中移除对应项
                    });
                });

                // 创建跳转按钮（假设这是 B站链接）
                let goToButton = document.createElement('button');
                goToButton.textContent = '跳转';
                goToButton.style = "height: 30px";
                goToButton.addEventListener('click', function() {
                    chrome.runtime.sendMessage({
                        type: 'SKIP_TO_VIDEO',
                        url: `https://www.bilibili.com/video/${key}`,
                        currentTime: videoItem.currentTime
                    });
                });
                // 将 BV 号和按钮添加到列表项
                li.appendChild(TitleAndTime);
                li.appendChild(goToButton);
                li.appendChild(deleteButton);

                // 将列表项添加到 ul 列表中
                videoList.appendChild(li);
            }
        }
    });
});