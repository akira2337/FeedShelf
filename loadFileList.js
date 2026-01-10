(() => {
    const CONFIG = {
        username: "akira2337", 
        repo: "secretStorage"
    };

    // --- ファイル内容読み込み ---
    async function loadFileContent(path) {
        const token = document.getElementById('ghToken').value;
        if (!token) return alert("トークンを入力して接続してください");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}`;

        try {
            const response = await fetch(url, {
                headers: { "Authorization": `token ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // 日本語対応デコード
                const content = decodeURIComponent(escape(atob(data.content)));
                
                document.getElementById('editor').value = content;
                document.getElementById('currentPath').innerText = path;
                document.getElementById('currentSha').value = data.sha;
                console.log("Loaded:", path, "SHA:", data.sha);
            }
        } catch (e) { alert("読み込みエラーが発生しました"); }
    }

    // --- リスト取得（共通関数） ---
    async function loadFileList() {
        const token = document.getElementById('ghToken').value;
        if (!token) return;

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
                        li.onclick = () => loadFileContent(file.path);
                        listArea.appendChild(li);
                    }
                });
            }
        } catch (e) { console.error("List refresh failed"); }
    }

    // --- ファイル保存（更新） ---
    async function saveFileContent() {
        const token = document.getElementById('ghToken').value;
        const path = document.getElementById('currentPath').innerText;
        const content = document.getElementById('editor').value;
        const sha = document.getElementById('currentSha').value;

        if (path === "なし") return alert("ファイルを選択してください");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}`;
        const b64Content = btoa(unescape(encodeURIComponent(content)));

        const body = {
            message: `Update ${path} via Web Manager`,
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
                // 【重要】新しいSHAを即座に反映（これで続けて保存が可能になる）
                document.getElementById('currentSha').value = result.content.sha;
                alert("保存完了しました。");
                // リストも念のため更新
                await loadFileList();
            } else {
                const err = await response.json();
                alert("保存失敗: " + err.message + "\n※他の場所で編集された可能性があります。再読み込みしてください。");
            }
        } catch (e) { alert("通信エラー"); }
    }

    // --- 新規ファイル作成 ---
    async function createNewFile() {
        const token = document.getElementById('ghToken').value;
        const newName = document.getElementById('newFileName').value;
        
        if (!newName) return alert("ファイル名を入力してください");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${newName}`;
        
        const body = {
            message: `Create ${newName}`,
            content: "" // 最初は空
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
                alert(`作成完了: ${newName}`);
                document.getElementById('newFileName').value = ""; // 入力欄を清掃
                await loadFileList(); // 【重要】リストを再読み込みして表示させる
            } else {
                const err = await response.json();
                alert("作成失敗: " + err.message);
            }
        } catch (e) { alert("通信エラー"); }
    }

    // --- ファイル削除 ---
    async function deleteFileContent() {
        const token = document.getElementById('ghToken').value;
        const path = document.getElementById('currentPath').innerText;
        const sha = document.getElementById('currentSha').value;

        if (path === "なし") return alert("ファイルを選択してください");
        if (!confirm(`${path} を削除しますか？`)) return;

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
                // 【重要】画面を初期状態に戻す
                document.getElementById('editor').value = "";
                document.getElementById('currentPath').innerText = "なし";
                document.getElementById('currentSha').value = "";
                await loadFileList(); // リストから消去
            } else {
                alert("削除失敗");
            }
        } catch (e) { alert("通信エラー"); }
    }

    // 公開
    window.loadFileList = loadFileList;
    window.saveFileContent = saveFileContent;
    window.createNewFile = createNewFile;
    window.deleteFileContent = deleteFileContent;
    
})();
