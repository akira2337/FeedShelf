(() => {
    const CONFIG = {
        username: "akira2337", 
        repo: "FeedShelf"
    };

    // --- ファイル読み込み関数（前回と同じですがSHA取得が重要） ---
    async function loadFileContent(path) {
        const token = document.getElementById('ghToken').value;
        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}`;

        try {
            const response = await fetch(url, {
                headers: { "Authorization": `token ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // 日本語化け対策付きデコード
                const content = decodeURIComponent(escape(atob(data.content)));
                document.getElementById('editor').value = content;
                document.getElementById('currentPath').innerText = path;
                // 【重要】保存に必須なSHAを隠し要素にセット
                document.getElementById('currentSha').value = data.sha;
            }
        } catch (e) { alert("読み込みエラー"); }
    }

    // --- 【新規追加】ファイル保存関数 ---
    async function saveFileContent() {
        const token = document.getElementById('ghToken').value;
        const path = document.getElementById('currentPath').innerText;
        const content = document.getElementById('editor').value;
        const sha = document.getElementById('currentSha').value;

        if (path === "なし") return alert("ファイルを選択してください");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}`;

        // 保存内容をBase64エンコード（日本語対応）
        const b64Content = btoa(unescape(encodeURIComponent(content)));

        const body = {
            message: `Update ${path} via Web Manager`, // コミットメッセージ
            content: b64Content,
            sha: sha // これがないとエラーになります
        };

        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const result = await response.json();
                // 新しいSHAに更新（続けて保存できるようにするため）
                document.getElementById('currentSha').value = result.content.sha;
                alert("GitHubに正常に保存（コミット）されました！");
            } else {
                const err = await response.json();
                alert("保存失敗: " + err.message);
            }
        } catch (e) { alert("通信エラーが発生しました"); }
    }

    async function loadFileList() {
        const token = document.getElementById('ghToken').value;
        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/`;
        try {
            const response = await fetch(url, { headers: { "Authorization": `token ${token}` } });
            if (response.ok) {
                const files = await response.json();
                const listArea = document.getElementById('fileList');
                listArea.innerHTML = "";
                files.forEach(file => {
                    if(file.type === "file") { // ディレクトリを除外してファイルのみ表示
                        const li = document.createElement('li');
                        li.textContent = file.name;
                        li.onclick = () => loadFileContent(file.path);
                        listArea.appendChild(li);
                    }
                });
            }
        } catch (e) { alert("通信エラー"); }
    }

    // 両方の関数を公開
    window.loadFileList = loadFileList;
    window.saveFileContent = saveFileContent;
})();
