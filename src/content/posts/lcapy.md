---
title: lcapy中设置受控源
published: 2025-09-26
updated: 2025-09-26
description: ''
tags: []
category: 代码
---

Lcapy 中设置受控源非常直观，它沿用了 SPICE 的经典语法。Lcapy 支持所有四种基本类型的线性受控源。

这四种受控源分别是：

1. **E**: 压控电压源 (VCVS - Voltage-Controlled Voltage Source)
2. **G**: 压控电流源 (VCCS - Voltage-Controlled Current Source)
3. **H**: 流控电压源 (CCVS - Current-Controlled Voltage Source)
4. **F**: 流控电流源 (CCCS - Current-Controlled Current Source)

下面我将详细解释每一种的设置方法，并提供可运行的 Python 代码示例。

---

### 1. 压控电压源 (VCVS) - E 元件

它的电压由电路中另外两点的电压差控制。

**语法**: `E<name> n+ n- nc+ nc- K`

* `E<name>`: 元件名称，例如 `E1`。
* `n+ n-`: 受控源自身的正负节点。
* `nc+ nc-`: **控制电压**的参考正负节点。
* `K`: 电压增益（无单位）。
* 关系式: `V(n+, n-) = K * V(nc+, nc-)`

**示例代码:**

假设我们要建立一个电压放大器模型，其输出电压是输入电压的 5 倍。

```python
from lcapy import Circuit

# 定义电路
# V1 是输入电压源
# R1 是输入电阻
# E1 是压控电压源，它的电压由节点1和0之间的电压（即V1的电压）控制
# R2 是输出负载
cct_vcvs = Circuit("""
V1 1 0 {u(t)}; down
R1 1 0 1k; right=2
E1 2 0 1 0 5; right=2, l=A_v=5
R2 2 0 1k; down
""")

# 绘制电路图
cct_vcvs.draw(style='american')

# 求解节点2的电压 V_out
V_out = cct_vcvs[2].v
print(f"压控电压源 (VCVS) 的输出电压 V(2): {V_out}")
# 预期结果: V(2) = 5 * V(1) = 5 * u(t)
```

---

### 2. 压控电流源 (VCCS) - G 元件

它产生的电流由电路中另外两点的电压差控制。

**语法**: `G<name> n+ n- nc+ nc- Gm`

* `G<name>`: 元件名称，例如 `G1`。
* `n+ n-`: 电流**从 n+ 流向 n-**。
* `nc+ nc-`: **控制电压**的参考正负节点。
* `Gm`: 跨导增益（单位是西门子 S）。
* 关系式: `I(n+ -> n-) = Gm * V(nc+, nc-)`

**示例代码:**

```python
from lcapy import Circuit

# 定义电路
# V1 是输入电压
# G1 是压控电流源，其电流由节点1和0之间的电压控制
# R1 是输出负载，G1产生的电流流过它
cct_vccs = Circuit("""
V1 1 0 {u(t)}; down
W 1 2; right # 导线
G1 2 0 1 0 0.1; down, l^=G_m=0.1
R1 2 0 50; right
""")

cct_vccs.draw(style='american')

# 求解流过电阻R1的电流 I_R1
I_R1 = cct_vccs.R1.i
print(f"压控电流源 (VCCS) 产生的电流 I(R1): {I_R1}")
# 预期结果: I(R1) = 0.1 * V(1) = 0.1 * u(t)
```

---

### 3. 流控电压源 (CCVS) - H 元件

它的电压由流过**另一个元件**的电流控制。

**关键点**: Lcapy 需要一个“电流传感器”来确定控制电流。通常，我们会使用一个**0V的电压源 (dummy voltage source)** 串联在需要测量电流的支路中，然后用这个0V电压源的名称来指定控制电流。

**语法**: `H<name> n+ n- V_sensor Rm`

* `H<name>`: 元件名称，例如 `H1`。
* `n+ n-`: 受控源自身的正负节点。
* `V_sensor`: **作为电流传感器的0V电压源**的名称。
* `Rm`: 跨阻增益（单位是欧姆 Ω）。
* 关系式: `V(n+, n-) = Rm * I(V_sensor)`

**示例代码:**

```python
from lcapy import Circuit

# 定义电路
# Vsense 是一个0V的电压源，用于“感知”流过 R1 的电流
# H1 是流控电压源，它的电压由流过 Vsense 的电流控制
cct_ccvs = Circuit("""
I1 0 1 {u(t)}; up
R1 1 a 100; right
Vsense a 0 0; down # 0V电压源作为电流传感器
H1 2 0 Vsense 50; right=3, l=R_m=50
R2 2 0 1k; down
""")

cct_ccvs.draw(style='american')

# 求解节点2的电压 V_out
V_out = cct_ccvs[2].v
print(f"流控电压源 (CCVS) 的输出电压 V(2): {V_out}")
# 预期结果: I(Vsense) = I1 = u(t), 所以 V(2) = 50 * I(Vsense) = 50 * u(t)
```

---

### 4. 流控电流源 (CCCS) - F 元件

它产生的电流由流过**另一个元件**的电流控制。和 CCVS 一样，它也需要一个0V电压源作为电流传感器。

**语法**: `F<name> n+ n- V_sensor Beta`

* `F<name>`: 元件名称，例如 `F1`。
* `n+ n-`: 电流**从 n+ 流向 n-**。
* `V_sensor`: **作为电流传感器的0V电压源**的名称。
* `Beta`: 电流增益（无单位），通常用于BJT等模型。
* 关系式: `I(n+ -> n-) = Beta * I(V_sensor)`

**示例代码 (BJT简化模型):**

```python
from lcapy import Circuit

# 定义电路
# V1 是基极驱动
# Vsense 用于感知基极电流 I_b
# F1 是流控电流源，模拟集电极电流 I_c = Beta * I_b
# R_L 是集电极负载电阻
cct_cccs = Circuit("""
V1 1 0 {u(t)}; down
R_B 1 a 1k; right
Vsense a 0 0; down # 感知基极电流 I_b
F1 2 0 Vsense 100; down, l^=\\beta=100 # I_c = 100 * I_b
V_CC 2 0 10; right # 电源
R_L 2 b 500; up # 负载电阻
W b V_CC.p; right
""")

cct_cccs.draw(style='american')

# 求解集电极电流 (即流过F1的电流)
I_c = cct_cccs.F1.i
print(f"流控电流源 (CCCS) 产生的电流 I(F1): {I_c}")
# 预期结果: I_b = V1 / R_B = u(t)/1000, 所以 I_c = 100 * I_b = 0.1 * u(t)
```

### 总结

| 类型 | 元件 | 描述 | 控制量 | 输出量 | 语法 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **VCVS** | **E** | 压控电压源 | 电压 `V(nc+, nc-)` | 电压 | `E name n+ n- nc+ nc- K` |
| **VCCS** | **G** | 压控电流源 | 电压 `V(nc+, nc-)` | 电流 | `G name n+ n- nc+ nc- Gm` |
| **CCVS** | **H** | 流控电压源 | 电流 `I(V_sensor)` | 电压 | `H name n+ n- V_sensor Rm` |
| **CCCS** | **F** | 流控电流源 | 电流 `I(V_sensor)` | 电流 | `F name n+ n- V_sensor Beta` |

**最重要的技巧**: 当你需要用电流作为控制量时（CCVS 和 CCCS），记得在被控制的支路中串联一个**值为0的电压源**，并用它的名字来告诉 Lcapy 你要测量哪里的电流。

