# RISC-V アセンブラ

<div class="riscv-assembler">
    <div class="container">
        <div id="app">
            <div id="instruction-rows"></div>
            <button id="add-row">命令を追加</button>
            <button id="generate">機械語生成</button>
            
            <div class="output">
                <h2>出力</h2>
                <div class="output-container">
                    <div>
                        <h3>バイナリ</h3>
                        <pre id="binary-output"></pre>
                        <button id="download-binary">バイナリダウンロード</button>
                    </div>
                    <div>
                        <h3>16進数</h3>
                        <pre id="hex-output"></pre>
                        <button id="download-hex">16進数ダウンロード</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js"></script>

<!-- CSSとJavaScriptの読み込み -->
<link rel="stylesheet" href="../assets/css/styles.css">
<script src="../assets/js/riscv_assembler.js"></script>