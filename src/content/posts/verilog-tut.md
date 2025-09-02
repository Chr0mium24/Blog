---
title: verilog入门
published: 2025-09-02
updated: 2025-09-02
description: ''
tags: [ECE2050]
category: 学习
---

## 模块(Module)和端口(Port)

### 1.基础用法

```verilog
module and_gate (
  input  a,       // 输入端口 a
  input  b,       // 输入端口 b
  input  c,d			// 当然你也可以写一起
  output out      // 输出端口 out
); 
  assign out = a & b; // 描述功能：out 是 a 和 b 的与运算结果

endmodule
```

### 2.端口类型

```verilog
module example (
  input             clk,       // 1位的输入,未标注reg默认类型为wire
  input [7:0]       data_in,   // 8位的输入总线 (位宽为8)
  output            valid,     // 1位的输出
  output reg [15:0] data_out,  // 16位的寄存器型输出
  inout [3:0]       bus        // 4位的双向总线
);
```

- Wire用于组合逻辑，不存储值，它的值由驱动它的元件（例如逻辑门或 assign 语句）决定。 

- Reg用于时序逻辑，代表一个存储元件，如触发器或锁存器。它可以保持一个值，直到被重新赋值。必须在 always 或 initial 块中被赋值。

## 基础语法

### 1.字面量

**<位宽>'<进制><数值>** 左边高位，右边低位

```verilog
wire [3:0] high_nibble = 4'b1010; // "nibble" 指4位 
wire [3:0] low_nibble  = 4'b1100; 
wire [7:0] byte_data; assign byte_data = {high_nibble, low_nibble};// 将两个4位信号拼接成一个8位信号 10101100
```

### 2.常量

1. parameter 可被外部重写(override)

```verilog
module memory #(
    parameter DATA_WIDTH = 8, // 定义一个可修改的参数
    parameter ADDR_WIDTH = 10
) (
    // ...
);
    // ...
endmodule

// 在实例化时，我们可以修改 DATA_WIDTH
// 创建一个16位宽的内存
memory #(
    .DATA_WIDTH(16) 
) mem_inst (
    // ...
);
```

2. localparam 局部常量外部无法修改，通常用作switch...case...语句的tag，用于代替常量

```verilog
localparam ADD = 2'b00;

always @(*) begin
    case (op_sel)
        ADD: result = a + b; // 使用 localparam 提高可读性
        // ...
    endcase
end
```

### 3.运算符

  | 操作符类型 | 操作符 |
| :--- | :--- |
| **算术操作符** | `+`, `-`, `*`, `/`, `%` (取模) |
| **位操作符** | `~` (取反), `&` (按位与), `|` (按位或), `^` (按位异或), `~^` (按位同或) |
| **逻辑操作符** | `!` (逻辑非), `&&` (逻辑与), `||` (逻辑或) |
| **关系操作符** | `>`, `<`, `>=`, `<=`, `==` (等于), `!=` (不等于) |
| **移位操作符** | `<<` (左移), `>>` (右移) |
| **拼接操作符** | `{}`, 例如 `{a, b}` |
| **复制操作符** | `{{}}`, 例如 `{4{1'b1}}` |

### 4.不同端口的赋值

wire: 使用assign 连续赋值 

reg:使用initial或always过程赋值，又分两种：

- **阻塞赋值 (Blocking Assignment) =** 立即执行并完成赋值

  ```verilog
  // 阻塞赋值 (组合逻辑)
  always @(*) begin
    b = a;
    c = b; // 这里的 b 是已经被 a 赋值后的新值
  end
  ```

- **非阻塞赋值 (Non-blocking Assignment) <=** 语句的右侧表达式会被计算，但赋值操作会延迟到整个块结束时才同时发生，行为是并行的

  ```verilog
  // 非阻塞赋值 (时序逻辑)
  always @(posedge clk) begin //(posedge: 上升沿触发，negedge: 下降沿触发)
    q1 <= d; // 在时钟上升沿，计算 d 的值
    q2 <= q1; // 同时，计算 q1 的旧值
             // 在块结束时，q1 更新为 d 的值，q2 更新为 q1 的旧值
             // 这会形成一个两级触发器
  end
  ```

>注意⚠️：尽管从**最终生成的硬件电路**的角度来看，always @(*) 块和使用 assign 驱动的 wire **是等价的**,但是always存在产生额外锁存器的风险，且层级和assign不同
>
>```verilog
>// 这个代码会生成一个锁存器！
>always @(*) begin
>      if (enable == 1'b1) begin
>          q = d;
>      end
>      // 问题：当 enable 不等于 1 时，没有告诉 q 应该是什么值！
>      // 综合器会认为：q 必须保持它之前的值，因此需要一个锁存器来存储它。
>end
>```
>```verilog
>// 修正：为所有分支都提供赋值
>always @(*) begin
>    	if (enable == 1'b1) begin
>        	q = d;
>    	end else begin
>        	q = 1'b0; // 或者 q = d_default_value;
>    	end
>end
>```
>
>**何时使用always @(*)：**当逻辑很复杂，需要用到 `if-else` 或 `case` 语句来提高代码可读性时，例如解码器、算术逻辑单元 (ALU)、状态机的组合逻辑部分等，可以像写高级语言一样描述复杂的逻辑。但仍需确保所有 `reg` 在所有代码分支中都被赋值，以避免意外生成锁存器。 
>
>

## 建模思想

### 1. 行为级建模 (Behavioral Modeling)

```verilog
assign {c_out, sum} = a + b + c_in;    
```

### 2. 数据流建模 (Dataflow Modeling)


```verilog
assign sum = a ^ b ^ c_in;
assign c_out = (a & b) | (b & c_in) | (a & c_in);
```

### 3. 结构级建模 (Structural Modeling)

```verilog
// 首先需要一个半加器模块
module half_adder(input a, b, output s, c);
    assign s = a ^ b;
    assign c = a & b;
endmodule

// 然后用结构化方式搭建全加器
module full_adder_struct(
    input a, b, c_in,
    output sum, c_out
);
    wire s1, c1, c2; // 定义内部连线

    // 实例化第一个半加器
    half_adder ha1 (
        .a(a), 
        .b(b), 
        .s(s1), 
        .c(c1)
    );

    // 实例化第二个半加器
    half_adder ha2 (
        .a(s1), 
        .b(c_in), 
        .s(sum), 
        .c(c2)
    );

    // 用一个或门连接两个进位
    or U1 (c_out, c1, c2);

endmodule
```

| 建模级别                | 核心思想                         | 主要关键字/语法                             | 抽象程度 |
| :---------------------- | :------------------------------- | :------------------------------------------ | :------- |
| **行为级 (Behavioral)** | 描述电路的**功能、算法**         | `always`, `initial`, `if-else`, `case`, `+` | **最高** |
| **数据流 (Dataflow)**   | 描述数据在电路中的**流动和变换** | `assign`, 逻辑运算符                        | **中等** |
| **结构级 (Structural)** | 描述电路的**构成和连接**         | 模块实例化 (`module_name inst_name (...)`)  | **最低** |
