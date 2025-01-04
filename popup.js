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
    
                //创建第一行:主题与按钮
                const firstLine = document.createElement('div');
                firstLine.className = 'firstLine';
                //创建Title元素
                const TitleAndTime = document.createElement('div');
                TitleAndTime.className = "TitleAndTime";
                TitleAndTime.innerHTML = `${videoItem.title}`;
                // 创建按钮区域
                const buttonArea = document.createElement('div');
                buttonArea.className = "buttonArea";
                // 创建删除按钮
                const deleteButton = document.createElement('button');
                deleteButton.style.height = "30px";
                deleteButton.textContent = '删除';
                deleteButton.type = 'button';
                deleteButton.addEventListener('click', () => {
                    // 点击删除按钮时，从 chrome.storage.local 中删除该条目，并删除列表项
                    chrome.storage.local.remove(key, () => li.remove());
                });

                // 创建跳转按钮，本质是广播一个SKIP_TO_VIDEO类型的Message。
                // background.js捕捉后，通过得到的信息创建新tab，再向新tab的contest.js发送包含时间戳的Message。
                // 新建tab的content.js收到Message后，对Video的CurrentTime进行设置。
                const goToButton = document.createElement('button');
                goToButton.textContent = '跳转';
                goToButton.type = 'button';
                goToButton.style.height = "30px";
                // 监听点击事件：跳转
                let url = `https://www.bilibili.com/video/${videoItem.bv}`;
                if(videoItem.p != 0){
                    url = `${url}?p=${videoItem.p}`
                }
                goToButton.addEventListener('click', () => {
                    chrome.runtime.sendMessage({
                        type: 'SKIP_TO_VIDEO',
                        url,
                        currentTime: videoItem.currentTime
                    });
                });
                buttonArea.append(goToButton, deleteButton)
                firstLine.append(TitleAndTime, buttonArea)

                // 创建第二行:时间戳
                const secondLine = document.createElement('div');
                secondLine.className = "secondLine"
                // 创建第二行左侧元素：当前播放位置
                const LeftTimeStamp = document.createElement('span');
                const seconds = Math.floor(videoItem.currentTime % 60);
                const minutes = Math.floor(videoItem.currentTime % 3600 / 60);
                const hours = Math.floor(videoItem.currentTime / 3600);
                LeftTimeStamp.innerHTML = `${hours}:${minutes}:${seconds}`;
                // 创建第二行右侧元素：视频总时长
                const RightTimeStamp = document.createElement('span');
                const duration_seconds = Math.floor(videoItem.duration % 60);
                const duration_minutes = Math.floor(videoItem.duration % 3600 / 60);
                const duration_hours = Math.floor(videoItem.duration / 3600);
                const duartion = `${duration_hours}:${duration_minutes}:${duration_seconds}`
                RightTimeStamp.innerHTML = duartion;
                secondLine.append(LeftTimeStamp, RightTimeStamp)
                // 将 BV 号和按钮添加到列表项
                li.append(firstLine, secondLine)
                // 将列表项添加到 ul 列表中
                videoList.appendChild(li);
            }
        }
    });
});