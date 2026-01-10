(() => {
    const CONFIG = {
        username: "akira2337", 
        repo: "secretStorage"
    };

    // 共通のヘッダー取得関数
    const getHeaders = (token) => ({
        "Authorization": `Bearer ${token}`, // token よりも Bearer を推奨
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    });

    // 日本語対応のBase64エンコード
    const toBase64 = (str) => {
        const bytes = new TextEncoder().encode(str);
        const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
        return btoa(binString);
    };

    // 日本語対応のBase64デコード
    const fromBase64 = (base64) => {
        const binString = atob(base64);
        const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    };

    async function loadFileContent(path) {
        const token = document.getElementById('ghToken').value;
        if (!token) return alert("トークンを入力してください");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}`;

        try {
            const response = await fetch(url, { headers: getHeaders(token) });
            if (response.ok) {
                const data = await response.json();
                document.getElementById('editor').value = fromBase64(data.content);
                document.getElementById('currentPath').innerText = path;
                document.getElementById('currentSha').value = data.sha;
            } else {
                const err = await response.json();
                alert(`取得失敗: ${err.message}`);
            }
        } catch (e) { alert("ネットワークエラーが発生しました。"); }
    }

    async function loadFileList() {
        const token = document.getElementById('ghToken').value;
        if (!token) return alert("トークンを入力してください");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/`;
        try {
            const response = await fetch(url, { headers: getHeaders(token) });
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
            } else {
                const err = await response.json();
                alert(`リスト取得失敗: ${err.message}\n設定（ユーザー名/リポジトリ名）を確認してください。`);
            }
        } catch (e) { alert("通信に失敗しました。URLや接続環境を確認してください。"); }
    }

    async function saveFileContent() {
        const token = document.getElementById('ghToken').value;
        const path = document.getElementById('currentPath').innerText;
        const content = document.getElementById('editor').value;
        const sha = document.getElementById('currentSha').value;

        if (path === "なし" || !path) return alert("ファイルを選択してください");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}`;
        const body = {
            message: `Update ${path} via Manager`,
            content: toBase64(content),
            sha: sha
        };

        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: getHeaders(token),
                body: JSON.stringify(body)
            });

            if (response.ok) {
                const result = await response.json();
                document.getElementById('currentSha').value = result.content.sha;
                alert("保存完了しました");
                await loadFileList();
            } else {
                const err = await response.json();
                alert(`保存失敗: ${err.message}`);
            }
        } catch (e) { alert("通信エラー"); }
    }

    async function createNewFile() {
        const token = document.getElementById('ghToken').value;
        const newName = document.getElementById('newFileName').value;
        if (!newName) return alert("ファイル名を入力してください");

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${newName}`;
        const body = { message: `Create ${newName}`, content: "" };

        try {
            const response = await fetch(url, {
                method: "PUT",
                headers: getHeaders(token),
                body: JSON.stringify(body)
            });

            if (response.ok) {
                alert(`作成完了: ${newName}`);
                document.getElementById('newFileName').value = "";
                await loadFileList();
            } else {
                const err = await response.json();
                alert(`作成失敗: ${err.message}`);
            }
        } catch (e) { alert("通信エラー"); }
    }

    async function deleteFileContent() {
        const token = document.getElementById('ghToken').value;
        const path = document.getElementById('currentPath').innerText;
        const sha = document.getElementById('currentSha').value;

        if (path === "なし" || !path) return alert("ファイルを選択してください");
        if (!confirm(`${path} を削除しますか？`)) return;

        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}`;

        try {
            const response = await fetch(url, {
                method: "DELETE",
                headers: getHeaders(token),
                body: JSON.stringify({ message: `Delete ${path}`, sha: sha })
            });

            if (response.ok) {
                alert("削除しました");
                document.getElementById('editor').value = "";
                document.getElementById('currentPath').innerText = "なし";
                document.getElementById('currentSha').value = "";
                await loadFileList();
            } else {
                const err = await response.json();
                alert(`削除失敗: ${err.message}`);
            }
        } catch (e) { alert("通信エラー"); }
    }

    // Windowオブジェクトへ公開
    window.loadFileList = loadFileList;
    window.saveFileContent = saveFileContent;
    window.createNewFile = createNewFile;
    window.deleteFileContent = deleteFileContent;
    window.loadFileContent = loadFileContent;
})();
