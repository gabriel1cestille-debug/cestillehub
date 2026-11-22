/* gzip em JavaScript puro, só para navegadores sem CompressionStream/DecompressionStream (iPhone com iOS anterior ao 16.4).
   Sem isso, esses aparelhos não conseguem ler nem gravar o universo comprimido na nuvem e "não salvam".
   gunzip: aceita blocos armazenados, Huffman fixo e dinâmico (o que o gzip nativo gera).
   gzip: Huffman fixo com busca de repetições (LZ77); gera gzip válido que qualquer leitor abre.
   Testado contra o zlib do Node em tools/test_gzip_fallback.cjs. */
(function () {
    'use strict';
    var LBASE = [3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59, 67, 83, 99, 115, 131, 163, 195, 227, 258],
        LEXT = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 0],
        DBASE = [1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193, 257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577],
        DEXT = [0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13],
        CLORD = [16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15];
    var CRC = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
    function crc32(u8) { var c = 0xFFFFFFFF; for (var i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
    function utf8(str) { if (typeof TextEncoder === 'function') return new TextEncoder().encode(str); var s = unescape(encodeURIComponent(str)), u = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); return u; }
    function text(u8) { if (typeof TextDecoder === 'function') return new TextDecoder('utf-8').decode(u8); var s = ''; for (var i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return decodeURIComponent(escape(s)); }

    /* ---------- inflate (estilo puff) ---------- */
    function huff(lengths, n) {   /* tabela canônica: contagem por comprimento + símbolos ordenados */
        var count = new Uint16Array(16), symbol = new Uint16Array(n), offs = new Uint16Array(16), i;
        for (i = 0; i < n; i++) count[lengths[i]]++;
        count[0] = 0; offs[1] = 0; for (i = 1; i < 15; i++) offs[i + 1] = offs[i] + count[i];
        for (i = 0; i < n; i++) if (lengths[i]) symbol[offs[lengths[i]]++] = i;
        return { count: count, symbol: symbol };
    }
    function inflate(src, pos) {
        var out = new Uint8Array(Math.max(1024, src.length * 4)), op = 0, bitBuf = 0, bitCnt = 0, i;
        function need(n) { while (bitCnt < n) { if (pos >= src.length) throw new Error('gzip truncado'); bitBuf |= src[pos++] << bitCnt; bitCnt += 8; } }
        function bits(n) { if (!n) return 0; need(n); var v = bitBuf & ((1 << n) - 1); bitBuf >>>= n; bitCnt -= n; return v; }
        function grow(extra) { if (op + extra > out.length) { var m = new Uint8Array(Math.max(out.length * 2, op + extra)); m.set(out.subarray(0, op)); out = m; } }
        function decode(h) { var code = 0, first = 0, index = 0, len; for (len = 1; len <= 15; len++) { code |= bits(1); var c = h.count[len]; if (code - c < first) return h.symbol[index + (code - first)]; index += c; first += c; first <<= 1; code <<= 1; } throw new Error('código inválido'); }
        var fixedL = null, fixedD = null;
        function codes(hl, hd) {
            for (;;) {
                var sym = decode(hl);
                if (sym < 256) { grow(1); out[op++] = sym; }
                else if (sym === 256) return;
                else { sym -= 257; if (sym >= 29) throw new Error('símbolo inválido'); var len = LBASE[sym] + bits(LEXT[sym]), ds = decode(hd); if (ds >= 30) throw new Error('distância inválida'); var dist = DBASE[ds] + bits(DEXT[ds]); if (dist > op) throw new Error('distância longe demais'); grow(len); for (var k = 0; k < len; k++) { out[op] = out[op - dist]; op++; } }
            }
        }
        var last;
        do {
            last = bits(1); var type = bits(2);
            if (type === 0) {
                bitBuf = 0; bitCnt = 0; if (pos + 4 > src.length) throw new Error('gzip truncado');
                var len = src[pos] | (src[pos + 1] << 8), nlen = src[pos + 2] | (src[pos + 3] << 8); pos += 4; if ((len ^ 0xFFFF) !== nlen) throw new Error('bloco armazenado inválido');
                grow(len); out.set(src.subarray(pos, pos + len), op); op += len; pos += len;
            } else if (type === 1) {
                if (!fixedL) { var l = new Uint8Array(288); for (i = 0; i < 144; i++) l[i] = 8; for (; i < 256; i++) l[i] = 9; for (; i < 280; i++) l[i] = 7; for (; i < 288; i++) l[i] = 8; fixedL = huff(l, 288); var d = new Uint8Array(30); for (i = 0; i < 30; i++) d[i] = 5; fixedD = huff(d, 30); }
                codes(fixedL, fixedD);
            } else if (type === 2) {
                var nlen2 = bits(5) + 257, ndist = bits(5) + 1, ncode = bits(4) + 4, lens = new Uint8Array(320);
                for (i = 0; i < ncode; i++) lens[CLORD[i]] = bits(3);
                var clh = huff(lens.subarray(0, 19), 19); lens = new Uint8Array(320); var idx = 0;
                while (idx < nlen2 + ndist) {
                    var s2 = decode(clh);
                    if (s2 < 16) lens[idx++] = s2;
                    else { var prev = 0, rep; if (s2 === 16) { if (!idx) throw new Error('repetição inválida'); prev = lens[idx - 1]; rep = 3 + bits(2); } else if (s2 === 17) rep = 3 + bits(3); else rep = 11 + bits(7); if (idx + rep > nlen2 + ndist) throw new Error('repetição longa demais'); while (rep--) lens[idx++] = prev; }
                }
                codes(huff(lens.subarray(0, nlen2), nlen2), huff(lens.subarray(nlen2, nlen2 + ndist), ndist));
            } else throw new Error('tipo de bloco inválido');
        } while (!last);
        return out.subarray(0, op);
    }
    function gunzipBytes(u8) {
        if (u8.length < 18 || u8[0] !== 0x1f || u8[1] !== 0x8b || u8[2] !== 8) throw new Error('não é gzip');
        var flg = u8[3], pos = 10;
        if (flg & 4) { pos += 2 + (u8[pos] | (u8[pos + 1] << 8)); }
        if (flg & 8) { while (u8[pos++]); }
        if (flg & 16) { while (u8[pos++]); }
        if (flg & 2) pos += 2;
        var out = inflate(u8, pos), n = u8.length, crc = (u8[n - 8] | (u8[n - 7] << 8) | (u8[n - 6] << 16) | (u8[n - 5] << 24)) >>> 0;
        if (crc32(out) !== crc) throw new Error('gzip corrompido (CRC)');
        return out;
    }

    /* ---------- deflate (Huffman fixo + LZ77) ---------- */
    function deflateBytes(src) {
        var out = new Uint8Array(Math.max(64, (src.length >> 1) + 64)), op = 0, bitBuf = 0, bitCnt = 0;
        function put(v, n) { bitBuf |= v << bitCnt; bitCnt += n; while (bitCnt >= 8) { if (op >= out.length) { var m = new Uint8Array(out.length * 2); m.set(out); out = m; } out[op++] = bitBuf & 255; bitBuf >>>= 8; bitCnt -= 8; } }
        function rev(code, len) { var r = 0; for (var i = 0; i < len; i++) { r = (r << 1) | (code & 1); code >>= 1; } return r; }
        function lit(sym) { if (sym < 144) put(rev(0x30 + sym, 8), 8); else if (sym < 256) put(rev(0x190 + sym - 144, 9), 9); else if (sym < 280) put(rev(sym - 256, 7), 7); else put(rev(0xC0 + sym - 280, 8), 8); }
        var lcode = new Uint8Array(259), dcodeFor = function (d) { var i = 29; while (DBASE[i] > d) i--; return i; };
        for (var s = 0; s < 29; s++) for (var l = LBASE[s]; l < (s < 28 ? LBASE[s + 1] : 259); l++) lcode[l] = s;
        lcode[258] = 28;
        put(1, 1); put(1, 2);   /* bloco final, Huffman fixo */
        var n = src.length, HS = 1 << 15, head = new Int32Array(HS).fill(-1), prev = new Int32Array(32768), i = 0, MAXCH = 24;
        function hash(a, b, c) { return ((a << 10) ^ (b << 5) ^ c) & (HS - 1); }
        function insert(p) { if (p + 2 < n) { var h = hash(src[p], src[p + 1], src[p + 2]); prev[p & 32767] = head[h]; head[h] = p; } }
        while (i < n) {
            var bestLen = 0, bestDist = 0;
            if (i + 2 < n) {
                var h = hash(src[i], src[i + 1], src[i + 2]), cand = head[h], chain = 0, lim = Math.min(258, n - i);
                while (cand >= 0 && i - cand <= 32768 && chain++ < MAXCH) {
                    if (src[cand + bestLen] === src[i + bestLen]) { var k = 0; while (k < lim && src[cand + k] === src[i + k]) k++; if (k > bestLen) { bestLen = k; bestDist = i - cand; if (k >= lim) break; } }
                    var nx = prev[cand & 32767]; if (nx >= cand) break; cand = nx;
                }
            }
            if (bestLen >= 3) {
                var ls = lcode[bestLen]; lit(257 + ls); if (LEXT[ls]) put(bestLen - LBASE[ls], LEXT[ls]);
                var ds = dcodeFor(bestDist); put(rev(ds, 5), 5); if (DEXT[ds]) put(bestDist - DBASE[ds], DEXT[ds]);
                for (var q = 0; q < bestLen; q++) insert(i + q); i += bestLen;
            } else { lit(src[i]); insert(i); i++; }
        }
        lit(256); if (bitCnt > 0) put(0, 8 - bitCnt);
        return out.subarray(0, op);
    }
    function gzipBytes(input) {
        var src = typeof input === 'string' ? utf8(input) : input, body = deflateBytes(src), crc = crc32(src), n = src.length, res = new Uint8Array(body.length + 18);
        res.set([0x1f, 0x8b, 8, 0, 0, 0, 0, 0, 0, 255], 0); res.set(body, 10); var p = 10 + body.length;
        res[p] = crc & 255; res[p + 1] = (crc >>> 8) & 255; res[p + 2] = (crc >>> 16) & 255; res[p + 3] = (crc >>> 24) & 255;
        res[p + 4] = n & 255; res[p + 5] = (n >>> 8) & 255; res[p + 6] = (n >>> 16) & 255; res[p + 7] = (n >>> 24) & 255;
        return res;
    }
    var api = { gzip: gzipBytes, gunzip: function (u8) { return text(gunzipBytes(u8)); }, gunzipBytes: gunzipBytes, crc32: crc32 };
    if (typeof module !== 'undefined' && module.exports) module.exports = api; else window.ruaGzip = api;
})();
