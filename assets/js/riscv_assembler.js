const saveAs = window.saveAs;

const INSTRUCTION_SET = [
    "ADD", "SUB", "AND", "OR", "XOR", "SLL", "SRL", "SRA", "SLT", "SLTU",
    "ADDI", "ANDI", "ORI", "XORI", "SLLI", "SRLI", "SRAI", "SLTI", "SLTIU",
    "LUI", "AUIPC", "JAL", "JALR", "BEQ", "BNE", "BLT", "BGE", "BLTU", "BGEU",
    "LB", "LH", "LW", "LBU", "LHU", "SB", "SH", "SW"
];

const register_names = [
    "zero", "ra", "sp", "gp", "tp", "t0", "t1", "t2", "s0/fp", "s1",
    "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7",
    "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11",
    "t3", "t4", "t5", "t6"
];

const opcodeMap = {
    // R-type
    ADD:  { opcode: "0110011", funct3: "000", funct7: "0000000" },
    SUB:  { opcode: "0110011", funct3: "000", funct7: "0100000" },
    AND:  { opcode: "0110011", funct3: "111", funct7: "0000000" },
    OR:   { opcode: "0110011", funct3: "110", funct7: "0000000" },
    XOR:  { opcode: "0110011", funct3: "100", funct7: "0000000" },
    SLL:  { opcode: "0110011", funct3: "001", funct7: "0000000" },
    SRL:  { opcode: "0110011", funct3: "101", funct7: "0000000" },
    SRA:  { opcode: "0110011", funct3: "101", funct7: "0100000" },
    SLT:  { opcode: "0110011", funct3: "010", funct7: "0000000" },
    SLTU: { opcode: "0110011", funct3: "011", funct7: "0000000" },

    // I-type
    ADDI:  { opcode: "0010011", funct3: "000" },
    ANDI:  { opcode: "0010011", funct3: "111" },
    ORI:   { opcode: "0010011", funct3: "110" },
    XORI:  { opcode: "0010011", funct3: "100" },
    SLLI:  { opcode: "0010011", funct3: "001", funct7: "0000000" },
    SRLI:  { opcode: "0010011", funct3: "101", funct7: "0000000" },
    SRAI:  { opcode: "0010011", funct3: "101", funct7: "0100000" },
    SLTI:  { opcode: "0010011", funct3: "010" },
    SLTIU: { opcode: "0010011", funct3: "011" },

    // U-type
    LUI:   { opcode: "0110111" },
    AUIPC: { opcode: "0010111" },

    // J-type
    JAL:   { opcode: "1101111" },
    JALR:  { opcode: "1100111", funct3: "000" },

    // I-type (LOAD)
    LB:   { opcode: "0000011", funct3: "000" },
    LH:   { opcode: "0000011", funct3: "001" },
    LW:   { opcode: "0000011", funct3: "010" },
    LBU:  { opcode: "0000011", funct3: "100" },
    LHU:  { opcode: "0000011", funct3: "101" },

    // S-type (STORE)
    SB:   { opcode: "0100011", funct3: "000" },
    SH:   { opcode: "0100011", funct3: "001" },
    SW:   { opcode: "0100011", funct3: "010" },

    // B-type (BRANCH)
    BEQ:  { opcode: "1100011", funct3: "000" },
    BNE:  { opcode: "1100011", funct3: "001" },
    BLT:  { opcode: "1100011", funct3: "100" },
    BGE:  { opcode: "1100011", funct3: "101" },
    BLTU: { opcode: "1100011", funct3: "110" },
    BGEU: { opcode: "1100011", funct3: "111" }
};

const toBinary = (num, bits) => {
    let val = Number(num);
    if (val < 0) val = (1 << bits) + val;
    return val.toString(2).padStart(bits, '0');
};

const encodeInstruction = ({ op, rd, rs1, rs2, imm }) => {
    const info = opcodeMap[op];
    if (!info) return { bin: "00000000000000000000000000000000", hex: "00000000" };

    let bin = "";
    const opcode = info.opcode;

    if (opcode === "0110011") { // R-type
        bin = `${info.funct7}${toBinary(rs2,5)}${toBinary(rs1,5)}${info.funct3}${toBinary(rd,5)}${opcode}`;
    } else if (opcode === "0010011" && info.funct7) { // I-type shift
        bin = `${info.funct7}${toBinary(imm,5)}${toBinary(rs1,5)}${info.funct3}${toBinary(rd,5)}${opcode}`;
    } else if (opcode === "0010011" || opcode === "0000011" || opcode === "1100111") { // I-type
        bin = `${toBinary(imm,12)}${toBinary(rs1,5)}${info.funct3}${toBinary(rd,5)}${opcode}`;
    } else if (opcode === "0100011") { // S-type
        const immBin = toBinary(imm, 12);
        bin = `${immBin.slice(0,7)}${toBinary(rs2,5)}${toBinary(rs1,5)}${info.funct3}${immBin.slice(7)}${opcode}`;
    } else if (opcode === "1100011") { // B-type
        const immBin = toBinary(imm, 13);
        bin = `${immBin[0]}${immBin.slice(2,8)}${toBinary(rs2,5)}${toBinary(rs1,5)}${info.funct3}${immBin.slice(8,12)}${immBin[1]}${opcode}`;
    } else if (opcode === "0110111" || opcode === "0010111") { // U-type
        bin = `${toBinary(imm,20)}${toBinary(rd,5)}${opcode}`;
    } else if (opcode === "1101111") { // J-type
        const immBin = toBinary(imm, 21); // 21ビットに拡張
        bin = `${immBin[0]}${immBin.slice(10,20)}${immBin[9]}${immBin.slice(1,9)}${toBinary(rd,5)}${opcode}`;
    } else {
        bin = "00000000000000000000000000000000";
    }

    const hex = parseInt(bin, 2).toString(16).padStart(8, '0');
    return {
        bin,
        hex
    };
};

// 命令タイプの定義を追加
const instructionTypes = {
  // R-type: rd, rs1, rs2を使用
  R_TYPE: ["ADD", "SUB", "AND", "OR", "XOR", "SLL", "SRL", "SRA", "SLT", "SLTU"],
  
  // I-type: rd, rs1, immを使用
  I_TYPE: ["ADDI", "ANDI", "ORI", "XORI", "SLLI", "SRLI", "SRAI", "SLTI", "SLTIU", "JALR", "LB", "LH", "LW", "LBU", "LHU"],
  
  // S-type: rs1, rs2, immを使用
  S_TYPE: ["SB", "SH", "SW"],
  
  // B-type: rs1, rs2, immを使用
  B_TYPE: ["BEQ", "BNE", "BLT", "BGE", "BLTU", "BGEU"],
  
  // U-type: rd, immを使用
  U_TYPE: ["LUI", "AUIPC"],
  
  // J-type: rd, immを使用
  J_TYPE: ["JAL"]
};

function getInstructionType(instruction) {
  for (const [type, instructions] of Object.entries(instructionTypes)) {
    if (instructions.includes(instruction)) {
      return type;
    }
  }
  return null;
}

function updateFieldVisibility(row, instruction) {
  const type = getInstructionType(instruction);
  const [opContainer, rdContainer, rs1Container, rs2Container, immContainer] = row.querySelectorAll('.field-container');
  
  // 各フィールドの入力要素を取得
  const rdSelect = rdContainer.querySelector('select');
  const rs1Select = rs1Container.querySelector('select');
  const rs2Select = rs2Container.querySelector('select');
  const immInput = immContainer.querySelector('input');

  // デフォルトですべてを無効化
  rdSelect.disabled = true;
  rs1Select.disabled = true;
  rs2Select.disabled = true;
  immInput.disabled = true;

  // タイプに応じて必要なフィールドを有効化
  switch (type) {
    case 'R_TYPE':
      rdSelect.disabled = false;
      rs1Select.disabled = false;
      rs2Select.disabled = false;
      break;
    case 'I_TYPE':
      rdSelect.disabled = false;
      rs1Select.disabled = false;
      immInput.disabled = false;
      break;
    case 'S_TYPE':
      rs1Select.disabled = false;
      rs2Select.disabled = false;
      immInput.disabled = false;
      break;
    case 'B_TYPE':
      rs1Select.disabled = false;
      rs2Select.disabled = false;
      immInput.disabled = false;
      break;
    case 'U_TYPE':
      rdSelect.disabled = false;
      immInput.disabled = false;
      break;
    case 'J_TYPE':
      rdSelect.disabled = false;
      immInput.disabled = false;
      break;
  }

  // 無効化されたフィールドの値をクリア
  if (rdSelect.disabled) rdSelect.value = "0";
  if (rs1Select.disabled) rs1Select.value = "0";
  if (rs2Select.disabled) rs2Select.value = "0";
  if (immInput.disabled) immInput.value = "";

  // 無効化されたフィールドのラベルも薄く表示
  [
    [rdContainer, rdSelect],
    [rs1Container, rs1Select],
    [rs2Container, rs2Select],
    [immContainer, immInput]
  ].forEach(([container, input]) => {
    container.style.opacity = input.disabled ? "0.5" : "1";
  });
}

function createHeaderRow() {
  const row = document.createElement('div');
  row.className = 'header-row';

  // アドレスヘッダー
  const addressHeader = document.createElement('div');
  addressHeader.className = 'address-header';
  addressHeader.innerHTML = 'Address<br>アドレス';
  row.appendChild(addressHeader);

  // フィールドラベル
  const labels = [
    ['opcode', '命令種別'],
    ['rd', 'デスティネーション'],
    ['rs1', 'ソース1'],
    ['rs2', 'ソース2'],
    ['imm', '即値']
  ];

  labels.forEach(label => {
    const container = document.createElement('div');
    container.className = 'field-container';
    
    const labelDiv = document.createElement('div');
    labelDiv.className = 'field-label';
    labelDiv.innerHTML = `${label[0]}<br>${label[1]}`;
    
    container.appendChild(labelDiv);
    row.appendChild(container);
  });

  return row;
}

function createInstructionRow(index) {
    const row = document.createElement('div');
    row.className = 'instruction-row';

    // アドレスラベル
    const addressLabel = document.createElement('div');
    addressLabel.className = 'address-label';
    addressLabel.textContent = `0x${(index * 4).toString(16).padStart(4, '0')}`;
    row.appendChild(addressLabel);

    // 命令選択（opcode）
    const opContainer = document.createElement('div');
    opContainer.className = 'field-container';
    const opSelect = document.createElement('select');
    opSelect.setAttribute('data-field', 'op');
    INSTRUCTION_SET.forEach(inst => {
        const option = document.createElement('option');
        option.value = inst;
        option.textContent = inst;
        opSelect.appendChild(option);
    });
    opContainer.appendChild(opSelect);
    row.appendChild(opContainer);

    // レジスタ選択（rd, rs1, rs2）
    ['rd', 'rs1', 'rs2'].forEach(reg => {
        const container = document.createElement('div');
        container.className = 'field-container';
        const select = document.createElement('select');
        select.setAttribute('data-field', reg);
        register_names.forEach((name, i) => {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `x${i} (${name})`;
            select.appendChild(option);
        });
        container.appendChild(select);
        row.appendChild(container);
    });

    // 即値入力
    const immContainer = document.createElement('div');
    immContainer.className = 'field-container';
    const immInput = document.createElement('input');
    immInput.type = 'number';
    immInput.setAttribute('data-field', 'imm');
    immInput.placeholder = 'imm';
    immContainer.appendChild(immInput);
    row.appendChild(immContainer);

    // 命令タイプに応じたフィールドの表示/非表示の設定
    opSelect.addEventListener('change', () => {
        updateFieldVisibility(row, opSelect.value);
    });
    updateFieldVisibility(row, opSelect.value);

    // 行を追加
    document.getElementById('instruction-rows').appendChild(row);
    return row;
}

// DOMが読み込まれた後に実行
document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('instruction-rows');
    const addRowButton = document.getElementById('add-row');
    const generateButton = document.getElementById('generate');
    const downloadBinaryButton = document.getElementById('download-binary');
    const downloadHexButton = document.getElementById('download-hex');

    // ヘッダー行の追加
    app.appendChild(createHeaderRow());

    // 最初の行を追加
    createInstructionRow(0);

    // イベントリスナーの設定
    addRowButton.addEventListener('click', () => {
        const currentRows = document.querySelectorAll('.instruction-row').length;
        createInstructionRow(currentRows);
    });

    generateButton.addEventListener('click', () => {
        const instructions = [];
        document.querySelectorAll('.instruction-row').forEach(row => {
            const op = row.querySelector('select[data-field="op"]').value;
            const rd = parseInt(row.querySelector('select[data-field="rd"]').value);
            const rs1 = parseInt(row.querySelector('select[data-field="rs1"]').value);
            const rs2 = parseInt(row.querySelector('select[data-field="rs2"]').value);
            const imm = parseInt(row.querySelector('input[data-field="imm"]').value || "0");

            instructions.push({ op, rd, rs1, rs2, imm });
        });

        const output = instructions.map(inst => encodeInstruction(inst));
        
        document.getElementById('binary-output').textContent = output.map(o => o.bin).join('\n');
        document.getElementById('hex-output').textContent = output.map(o => o.hex).join('\n');
    });

    downloadBinaryButton.addEventListener('click', () => {
        const binaryOutput = document.getElementById('binary-output').textContent;
        const blob = new Blob([binaryOutput], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'mem.txt');
    });

    downloadHexButton.addEventListener('click', () => {
        const hexOutput = document.getElementById('hex-output').textContent;
        const blob = new Blob([hexOutput], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, 'mem.hex');
    });
}); 