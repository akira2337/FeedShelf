(() => {
    // このスコープ（{}の中）にある変数は、外のデベロッパーツールからは見えません
    async function _secureProcess() {
        const val = document.getElementById('passInput').value;
        if (!val) return;

        // ハッシュ化の計算
        const msgUint8 = new TextEncoder().encode(val);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

        // ページ遷移
        window.location.href = hashHex + ".html";

        setTimeout(() => {
            document.getElementById('error').innerText = "アクセス権限がありません";
        }, 1000);
    }

    // グローバルな window オブジェクトに、実行用の関数だけを紐付けます
    // 名前を entry ではなく launch 等に変えるとさらに推測されにくくなります
    window.launch = _secureProcess;
})();