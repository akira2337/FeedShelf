// 攻撃コードデータベース
const EXPLOIT_DB = {
    "CVE-2023-3482": "# Exploit: Apache 2.4.41 RCE\nimport requests\ntarget = 'http://target/api'\ndef exploit():\n    r = requests.post(target, data={'cmd': 'id'})\n    print(r.text)\nexploit()",
    "CVE-2024-1002": "# Exploit: Header Leakage\nimport socket\ns = socket.socket()\ns.connect(('target', 80))\ns.send(b'HEAD / HTTP/1.1\\r\\n\\r\\n')\nprint(s.recv(1024))"
};

function writeLog(msg, color = "var(--main)") {
    const logArea = document.getElementById('log');
    const div = document.createElement('div');
    div.style.color = color;
    div.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logArea.prepend(div);
}

// 統合診断シーケンス
async function startFullAudit() {
    const target = document.getElementById('target-domain').value;
    if(!target) return alert("ターゲットを入力してください");

    writeLog(`--- AUDIT INITIATED: ${target} ---`, "var(--blue)");
    startHealthCheck(target);

    // 各ステップのシミュレーション
    const steps = [
        {id: 1, msg: "Executing OSINT / Geo-location lookup..."},
        {id: 2, msg: "Crawling directories for sensitive files..."},
        {id: 3, msg: "Analyzing banners for CVE matches...", color: "var(--red)"},
        {id: 4, msg: "Compiling Assessment Report..."}
    ];

    for(let s of steps) {
        document.querySelectorAll('.audit-step').forEach(el => el.style.background = 'none');
        document.getElementById(`step-${s.id}`).style.background = 'rgba(0,255,65,0.1)';
        writeLog(s.msg, s.color || "var(--main)");
        await new Promise(r => setTimeout(r, 1500));
    }

    showReport(target);
}

// 死活監視（Target Health）
function startHealthCheck(target) {
    const dot = document.getElementById('health-dot');
    const text = document.getElementById('health-text');
    const lat = document.getElementById('latency-ms');

    setInterval(() => {
        const online = Math.random() > 0.1; // 10%でダウン演出
        dot.className = online ? "status-dot online" : "status-dot offline";
        text.innerText = online ? "TARGET ONLINE" : "CONNECTION LOST";
        lat.innerText = online ? Math.floor(Math.random() * 60) + 10 : "---";
        if(!online) writeLog("ALERT: Target Unresponsive", "var(--red)");
    }, 4000);
}

function showReport(target) {
    document.getElementById('rep-target').innerText = target;
    document.getElementById('terminal-view').style.display = 'none';
    document.getElementById('report-area').style.display = 'block';
    
    // CVE IDをクリック可能にする
    document.querySelectorAll('.cve-id').forEach(el => {
        el.onclick = () => openExploit(el.innerText);
    });
}

function openExploit(cve) {
    document.getElementById('exploit-title').innerText = `EXPLOIT DATABASE: ${cve}`;
    document.getElementById('exploit-code').innerText = EXPLOIT_DB[cve] || "# No local payload available.";
    document.getElementById('exploit-db-overlay').style.display = 'block';
}

function closeExploit() {
    document.getElementById('exploit-db-overlay').style.display = 'none';
}