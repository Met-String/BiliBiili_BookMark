document.addEventListener('DOMContentLoaded', function() {
    // 获取要展示列表的 DOM 元素
    const videoList = document.getElementById('videoList');

    // 从 chrome.storage.local 获取存储的 BV 号和时间
    chrome.storage.local.get(null, (items) => {
        // 遍历存储的每个键值对
        for (let key in items) {
            if (items.hasOwnProperty(key)) {
                const videoItem = items[key];

                // 创建列表项
                const li = document.createElement('li');
                li.className = 'videoItem';
                // li.style.fontWeight = 'bold';
    
                // 创建时间戳元素
                const TitleAndTime = document.createElement('span');
                TitleAndTime.className = "TitleAndTime";
                const seconds = Math.floor(videoItem.currentTime % 60);;
                const minutes = Math.floor(videoItem.currentTime % 3600 / 60);
                const hours = Math.floor(videoItem.currentTime / 3600);
                TitleAndTime.innerHTML = `${videoItem.title}<br>${hours}:${minutes}:${seconds}`;

                // 创建删除按钮
                const deleteButton = document.createElement('button');
                deleteButton.style.height = "30px";
                deleteButton.textContent = '删除';
                deleteButton.addEventListener('click', () => {
                    // 点击删除按钮时，从 chrome.storage.local 中删除该条目，并删除列表项
                    chrome.storage.local.remove(key, () => li.remove());
                });

                // 创建跳转按钮，其原理本质是广播一个SKIP_TO_VIDEO类型的Message。
                // 之后的工作交由background.js进行处理
                // background.js通过得到的信息创建新tab，再向新建tab发送包含时间戳的Message
                // 新建tab的content.js收到Message后，对Video的CurrentTime进行设置
                const goToButton = document.createElement('button');
                goToButton.textContent = '跳转';
                goToButton.style.height = "30px";
                goToButton.addEventListener('click', () => {
                    chrome.runtime.sendMessage({
                        type: 'SKIP_TO_VIDEO',
                        url: `https://www.bilibili.com/video/${key}`,
                        currentTime: videoItem.currentTime
                    });
                });
                // 将 BV 号和按钮添加到列表项
                li.append(TitleAndTime, goToButton, deleteButton)
                // 将列表项添加到 ul 列表中
                videoList.appendChild(li);
            }
        }
    });
});