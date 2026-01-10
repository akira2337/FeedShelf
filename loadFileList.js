(() => {
    const CONFIG = {
        username: "akira2337", 
        repo: "secretStorage"
    };

    // --- 1. ファイル内容を読み込む ---
    async function loadFileContent(path) {
        const token = document.getElementById('ghToken').value;
        if (!token) return alert("トークンを入力してください");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}`;

        try {
            const response = await fetch(url, {
                headers: { "Authorization": `token ${token}`, "Cache-Control": "no-cache" }
            });
            if (response.ok) {
                const data = await response.json();
                // 日本語化け対策デコード
                const content = decodeURIComponent(escape(atob(data.content)));
                
                document.getElementById('editor').value = content;
                document.getElementById('currentPath').innerText = path;
                document.getElementById('currentSha').value = data.sha;
            } else {
                alert("ファイルの取得に失敗しました");
            }
        } catch (e) {
            alert("読み込みエラーが発生しました");
        }
    }

    // --- 2. ファイルリストを取得する ---
    async function loadFileList() {
        const token = document.getElementById('ghToken').value;
        if (!token) return alert("トークンが必要です");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/`;
        try {
            const response = await fetch(url, { 
                headers: { "Authorization": `token ${token}`, "Cache-Control": "no-cache" } 
            });
            if (response.ok) {
                const files = await response.json();
                const listArea = document.getElementById('fileList');
                listArea.innerHTML = "";
                files.forEach(file => {
                    if(file.type === "file") {
                        const li = document.createElement('li');
                        li.textContent = file.name;
                        // クリック時に読み込み関数を呼ぶ
                        li.onclick = () => loadFileContent(file.path);
                        listArea.appendChild(li);
                    }
                });
            } else {
                alert("リストの取得に失敗しました。トークンやリポジトリ名を確認してください。");
            }
        } catch (e) { alert("通信エラー"); }
    }

    // --- 3. ファイルを保存（更新）する ---
    async function saveFileContent() {
        const token = document.getElementById('ghToken').value;
        const path = document.getElementById('currentPath').innerText;
        const content = document.getElementById('editor').value;
        const sha = document.getElementById('currentSha').value;

        if (path === "なし" || !path) return alert("ファイルを選択してください");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}`;
        const b64Content = btoa(unescape(encodeURIComponent(content)));

        const body = {
            message: `Update ${path} via Manager`,
            content: b64Content,
            sha: sha
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
                // 新しいSHAをセット（連続保存を可能にする）
                document.getElementById('currentSha').value = result.content.sha;
                alert("GitHubへ保存完了しました");
                await loadFileList(); // リスト更新
            } else {
                const err = await response.json();
                alert("保存失敗: " + err.message);
            }
        } catch (e) { alert("通信エラー"); }
    }

    // --- 4. 新規ファイルを作成する ---
    async function createNewFile() {
        const token = document.getElementById('ghToken').value;
        const newName = document.getElementById('newFileName').value;
        
        if (!newName) return alert("ファイル名を入力してください");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${newName}`;
        const body = { message: `Create ${newName}`, content: "" };

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
                alert(`作成完了: ${newName}`);
                document.getElementById('newFileName').value = "";
                await loadFileList(); // 新しいファイルをリストに反映
            } else {
                const err = await response.json();
                alert("作成失敗: " + err.message);
            }
        } catch (e) { alert("通信エラー"); }
    }

    // --- 5. ファイルを削除する ---
    async function deleteFileContent() {
        const token = document.getElementById('ghToken').value;
        const path = document.getElementById('currentPath').innerText;
        const sha = document.getElementById('currentSha').value;

        if (path === "なし" || !path) return alert("ファイルを選択してください");
        if (!confirm(`${path} を完全に削除しますか？`)) return;

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}`;

        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: {
                    "Authorization": `token ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ message: `Delete ${path}`, sha: sha })
            });

            if (response.ok) {
                alert("削除しました");
                document.getElementById('editor').value = "";
                document.getElementById('currentPath').innerText = "なし";
                document.getElementById('currentSha').value = "";
                await loadFileList(); // リストから削除を反映
            } else {
                alert("削除に失敗しました");
            }
        } catch (e) { alert("通信エラー"); }
    }

    // --- 重要：HTML側の onclick から呼べるように window オブジェクトに紐付ける ---
    window.loadFileList = loadFileList;
    window.saveFileContent = saveFileContent;
    window.createNewFile = createNewFile;
    window.deleteFileContent = deleteFileContent;
    // 内部関数も必要なら紐付け（リストクリック用）
    window.loadFileContent = loadFileContent;
    
})();
