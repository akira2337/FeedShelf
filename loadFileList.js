(() => {
    const CONFIG = {
        username: "akira2337", 
        repo: "secretStorage"
    };

    // 共通ヘッダー（Bearerトークン形式）
    const getHeaders = (token) => ({
        "Authorization": `Bearer ${token}`,
        "Accept": "application/vnd.github.v3+json",
        "Content-Type": "application/json"
    });

    // 日本語対応：Base64エンコード
    const toBase64 = (str) => {
        const bytes = new TextEncoder().encode(str);
        const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
        return btoa(binString);
    };

    // 日本語対応：Base64デコード
    const fromBase64 = (base64) => {
        const binString = atob(base64);
        const bytes = Uint8Array.from(binString, (m) => m.charCodeAt(0));
        return new TextDecoder().decode(bytes);
    };

    // --- 1. ファイル内容を読み込む ---
    async function loadFileContent(path) {
        const token = document.getElementById('ghToken').value;
        if (!token) return alert("トークンを入力してください");

        // 【キャッシュ対策】URLにタイムスタンプを付与
        const cacheBuster = `t=${new Date().getTime()}`;
        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/${path}?${cacheBuster}`;

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
        } catch (e) { alert("読み込みエラーが発生しました。"); }
    }

    // --- 2. ファイルリストを取得する ---
    async function loadFileList() {
        const token = document.getElementById('ghToken').value;
        if (!token) return alert("トークンを入力してください");

        // 【キャッシュ対策】リスト取得時もタイムスタンプを付与
        const cacheBuster = `t=${new Date().getTime()}`;
        const url = `https://api.github.com/repos/${CONFIG.username}/${CONFIG.repo}/contents/?${cacheBuster}`;

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
                alert(`リスト取得失敗: ${err.message}`);
            }
        } catch (e) { alert("通信に失敗しました。"); }
    }

    // --- 3. ファイルを保存（更新）する ---
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
                // 新しいSHAを隠し要素に更新
                document.getElementById('currentSha').value = result.content.sha;
                alert("保存完了しました");
                // 保存後、少し待ってからリストを再読込（反映ラグ対策）
                setTimeout(loadFileList, 1000);
            } else {
                const err = await response.json();
                alert(`保存失敗: ${err.message}`);
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
                headers: getHeaders(token),
                body: JSON.stringify(body)
            });

            if (response.ok) {
                alert(`作成完了: ${newName}`);
                document.getElementById('newFileName').value = "";
                setTimeout(loadFileList, 1000);
            } else {
                const err = await response.json();
                alert(`作成失敗: ${err.message}`);
            }
        } catch (e) { alert("通信エラー"); }
    }

    // --- 5. ファイルを削除する ---
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
                setTimeout(loadFileList, 1000);
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
