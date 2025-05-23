document.addEventListener('DOMContentLoaded', function() {
    // 获取要展示列表的 DOM 元素
    const videoList = document.getElementById('videoList');

    // 从 chrome.storage.local 获取存储的 BV 号和时间
    chrome.storage.local.get(null, (items) => {
        let bookmarks = Object.entries(items);
        bookmarks.sort((a, b) =>  b[1].recordTime - a[1].recordTime);
        // 遍历存储的每个键值对
        for (let [key, videoItem] of bookmarks) {
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
            deleteButton.className = 'itemButton';
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
            goToButton.className = 'itemButton';
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

            // 创建第三行：进度条
            const thirdLine = document.createElement('div');
            thirdLine.className = "thirdLine"
            // 创建进度条容器
            const progressBar = document.createElement('div');
            progressBar.className = 'progress-bar';
            // 创建进度条填充部分
            const progressFill = document.createElement('div');
            progressFill.className = 'progress-fill';
            // 计算视频播放百分比
            const percentage = (videoItem.currentTime / videoItem.duration) * 100
            progressFill.style.width = `${percentage}%`;
            progressBar.appendChild(progressFill);
            thirdLine.appendChild(progressBar);
            // 将 BV 号和按钮添加到列表项
            li.append(firstLine, secondLine, thirdLine);

            // 将列表项添加到 ul 列表中
            videoList.appendChild(li);
        }
    });

    // 为下载按钮添加点击事件监听器
    document.getElementById('downloadButtonIcon').addEventListener('click', () => {
            chrome.storage.local.get(null, (items) => {
            // 创建一个 Blob 对象，包含要下载的数据
            const blob = new Blob([JSON.stringify(items)], { type: 'application/json' });
            // 创建一个 URL 对象，用于表示 Blob 对象
            const url = URL.createObjectURL(blob);
            // 创建一个 <a> 元素，用于触发下载</a>
            const link = document.createElement('a');
            link.href = url;
            link.download = 'BBVBookmarks.json';
            link.click();
        })
    })

    // 为上传按钮添加点击事件监听器
    document.getElementById('uploadButtonIcon').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.click();

        input.addEventListener('change', () => {
            const file = input.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    chrome.storage.local.set(data, () => {
                        console.log("导入成功！", data);
                    });
                } catch (e) {
                    console.error("上传失败：JSON 文件格式不合法", e);
                }
            };
            reader.readAsText(file);
        });
    })

});