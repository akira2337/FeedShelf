(() => {
    const _0x4a21 = ["\x65\x6E\x63\x6F\x64\x65", "\x64\x69\x67\x65\x73\x74", "\x53\x48\x41\x2D\x32\x35\x36", "\x66\x72\x6F\x6D", "\x6D\x61\x70", "\x74\x6F\x53\x74\x72\x69\x6E\x67", "\x70\x61\x64\x53\x74\x61\x72\x74", "\x6A\x6F\x69\x6E", "\x2E\x68\x74\x6D\x6C", "\x48\x45\x41\x44", "\x6F\x6B", "\x68\x72\x65\x66", "\x70\x61\x73\x73\x49\x6E\x70\x75\x74", "\x76\x61\x6C\x75\x65", "\x65\x72\x72\x6F\x72", "\x69\x6E\x6E\x65\x72\x54\x65\x78\x74"];
    async function _0x9f2a() {
        const _0x1c2b = document.getElementById(_0x4a21[12])[_0x4a21[13]];
        if (!_0x1c2b) return;
        const _0x3d4e = new TextEncoder()[_0x4a21[0]](_0x1c2b);
        const _0x5f6a = await crypto.subtle[_0x4a21[1]](_0x4a21[2], _0x3d4e);
        const _0x2b8c = Array[_0x4a21[3]](new Uint8Array(_0x5f6a));
        const _0x7e9d = _0x2b8c[_0x4a21[4]]((_0x1122) => _0x1122[_0x4a21[5]](16)[_0x4a21[6]](2, "0"))[_0x4a21[7]]("");
        const _0x4455 = _0x7e9d + _0x4a21[8];
        try {
            const _0x8899 = await fetch(_0x4455, { method: _0x4a21[9] });
            if (_0x8899[_0x4a21[10]]) {
                window.location.href = _0x4455;
            } else {
                document.getElementById(_0x4a21[14])[_0x4a21[15]] = "\u30a2\u30af\u30bb\u30b9\u6a29\u9650\u304c\u3042\u308a\u307e\u305b\u3093";
            }
        } catch (_0xef) {
            document.getElementById(_0x4a21[14])[_0x4a21[15]] = "\u901a\u4fe1\u30a8\u30e9\u30fc";
        }
    }
    window.launch = _0x9f2a;
})();
