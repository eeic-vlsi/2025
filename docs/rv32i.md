# RISC-V RV32I仕様メモ

<figure markdown="span">
  ![](img/format.png){ width="800" }
  <figcaption>RV32I命令フォーマット。</figcaption>
</figure>

* 以下で`rd`や`rs1`、`rs2`はそれぞれに格納された値 (参考ソースにおける`rd_val`、`rs1_val`、`rs2_val`など) のこと

| 命令   | `opcode[6:0]` | 演算内容                             | 分岐先アドレス           |
|--------|----------------|--------------------------------------|--------------------------|
| ADDI   | 0010011         | rd = rs1 + imm                      | ×                        |
| XORI   | 0010011         | rd = rs1 ^ imm                      | ×                        |
| ORI    | 0010011         | rd = rs1 \| imm                     | ×                        |
| ANDI   | 0010011         | rd = rs1 & imm                      | ×                        |
| ADD    | 0110011         | rd = rs1 + rs2                       | ×                        |
| SUB    | 0110011         | rd = rs1 - rs2                       | ×                        |
| XOR    | 0110011         | rd = rs1 ^ rs2                      | ×                        |
| OR     | 0110011         | rd = rs1 \| rs2                     | ×                        |
| AND    | 0110011         | rd = rs1 & rs2                      | ×                        |
| SLTI   | 0010011         | rd = (signed)rs1 < imm              | ×                        |
| SLTIU  | 0010011         | rd = rs1 < imm (unsigned)           | ×                        |
| SLT    | 0110011         | rd = (signed)rs1 < (signed)rs2      | ×                        |
| SLTU   | 0110011         | rd = rs1 < rs2 (unsigned)           | ×                        |
| SLLI   | 0010011         | rd = rs1 << imm[4:0]                   | ×                        |
| SRLI   | 0010011         | rd = rs1 >> imm[4:0]                   | ×                        |
| SRAI   | 0010011         | rd = (signed)rs1 >>> imm[4:0]          | ×                        |
| SLL    | 0110011         | rd = rs1 << rs2[4:0]                 | ×                        |
| SRL    | 0110011         | rd = rs1 >> rs2[4:0]                | ×                        |
| SRA    | 0110011         | rd = (signed)rs1 >>> rs2[4:0]       | ×                        |
| LUI    | 0110111         | rd = imm                            | ×                        |
| AUIPC  | 0010111         | rd = pc + imm                       | ×                        |
| LB     | 0000011         | rd = Mem[rs1 + imm] (byte)            | ×                        |
| LH     | 0000011         | rd = Mem[rs1 + imm] (half)            | ×                        |
| LW     | 0000011         | rd = Mem[rs1 + imm] (word)            | ×                        |
| LBU    | 0000011         | rd = Mem[rs1 + imm] (byte, unsigned)  | ×                        |
| LHU    | 0000011         | rd = Mem[rs1 + imm] (half, unsigned)  | ×                        |
| SB     | 0100011         | Mem[rs1 + imm] = rs2 (byte)           | ×                        |
| SH     | 0100011         | Mem[rs1 + imm] = rs2 (half)           | ×                        |
| SW     | 0100011         | Mem[rs1 + imm] = rs2 (word)           | ×                        |
| BEQ    | 1100011         | if (rs1 == rs2) branch              | pc + imm                 |
| BNE    | 1100011         | if (rs1 != rs2) branch              | pc + imm                 |
| BLT    | 1100011         | if (rs1 < rs2) (signed) branch            | pc + imm                 |
| BGE    | 1100011         | if (rs1 >= rs2) (signed) branch           | pc + imm                 |
| BLTU   | 1100011         | if (rs1 < rs2) (unsigned) branch          | pc + imm                 |
| BGEU   | 1100011         | if (rs1 >= rs2) (unsigned) branch        | pc + imm                 |
| JAL    | 1101111         | rd = pc + 4; jump                   | pc + imm                 |
| JALR   | 1100111         | rd = pc + 4; jump                   | (rs1 + imm) & ~1         |