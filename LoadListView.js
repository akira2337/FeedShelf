(() => {
    // 外部から隠蔽したい固定設定
    const CONFIG = {
        username: "akira2337", // 書き換えてください
        repo: "FeedShelf"           // 書き換えてください
    };

    // ファイルの中身を読み込む関数（クリック時に実行）
    async function loadFileContent(path) {
        const token = document.getElementById('ghToken').value;
        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}`;

        try {
            const response = await fetch(url, {
                headers: { "Authorization": `token ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Base64デコードして中身をエディタ（textarea）に表示
                // ※b64DecodeUnicodeは日本語化け対策
                const content = decodeURIComponent(escape(atob(data.content)));
                document.getElementById('editor').value = content;
                document.getElementById('currentPath').innerText = path;
                // 保存時に必要な「現在のSHA」を保持
                document.getElementById('currentSha').value = data.sha;
            }
        } catch (e) {
            alert("読み込みエラーが発生しました");
        }
    }

    // ファイル一覧を取得する関数
    async function loadFileList() {
        const token = document.getElementById('ghToken').value;
        if (!token) {
            alert("トークンを入力してください");
            return;
        }

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/`;

        try {
            const response = await fetch(url, {
                headers: { "Authorization": `token ${token}` }
            });

            if (response.ok) {
                const files = await response.json();
                const listArea = document.getElementById('fileList');
                listArea.innerHTML = "";

                files.forEach(file => {
                    const li = document.createElement('li');
                    li.textContent = file.name;
                    // カプセル化された内部の関数を呼び出す
                    li.onclick = () => loadFileContent(file.path);
                    listArea.appendChild(li);
                });
            } else {
                alert("取得失敗。トークンまたは設定を確認してください。");
            }
        } catch (e) {
            alert("通信エラーが発生しました");
        }
    }

    // 実行用関数をグローバル（window）に公開
    window.loadFileList = loadFileList;
})();