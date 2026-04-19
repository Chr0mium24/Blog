---
title: LQR与卡尔曼滤波的同构(草稿)
published: 2026-04-19
updated: 2026-04-19
description: ''
tags: []
category: 知识
---

### **卡尔曼滤波**

##### **状态方程**

\$\$\
\left\\{\begin{aligned} x\_k &= A x\_{k-1} + B u\_{k-1} + w\_{k-1}\\\ z\_k &= H x\_k + v\_k \end{aligned} \right.\
\$\$



其中w是外界扰动，协方差记作Q=E\[ww^T]

v是观测误差，协方差记作R=E\[vv^T]

根据卡尔曼滤波的概率论假设，过程噪声和测量噪声必须是相互独立的白噪声，且服从高斯（正态）分布： w \sim \mathcal{N}(0, Q)， v \sim \mathcal{N}(0, R)。

各种噪声相互独立，因此：E\[e\_k^- v\_k^T] = 0，E\[v\_k (e\_k^-)^T] = 0，E\[e\_{k} w\_{k}^T ]=0

##### **更新方程**

\hat{x}\_k = \hat{x}\_k^- + K\_k (z\_k - H \hat{x}\_k^-)

为什么更新方程长这样呢。考虑两个独立的信息源：一个是基于模型的先验预测分布 \mathcal{N}(\hat{x}\_k^-, P\_k^-)，另一个是传感器的测量分布 \mathcal{N}(z\_k, R)。根据贝叶斯定理，结合两个独立证据的后验概率等于两个高斯概率密度函数的乘积。两个高斯指数项相加后，

\$\$\
P \propto e^{\left(-\frac{(x - \mu\_1)^2}{2\sigma\_1^2}\right)} \times e^{\left(-\frac{(x - \mu\_2)^2}{2\sigma\_2^2}\right)} = e^{-\left(\frac{(x - \mu\_1)^2}{2\sigma\_1^2} + \frac{(x - \mu\_2)^2}{2\sigma\_2^2}\right)}\
\$\$



其均值必定呈现出一种线性加权的形式。因此，假设后验状态的线性更新结构：\hat{x}\_k = \hat{x}\_k^- + K\_k (z\_k - H \hat{x}\_k^-)，接下来我们只需通过最小化方差来求解最优的权重矩阵 K\_k。

\hat{x}\_k^- = A \hat{x}\_{k-1} + B u\_{k-1}

e\_k^- = x\_k - \hat{x}\_k^- = A(x\_{k-1} - \hat{x}\_{k-1}) + w\_{k-1}= A e\_{k-1} + w\_{k-1}

把e的协方差记作P=E\[ee^T]，因此：

\$\$\
\begin{aligned} P\_k^- &= E\[e\_k^- (e\_k^-)^T] \\\ &= E\[(A e\_{k-1} + w\_{k-1})(A e\_{k-1} + w\_{k-1})^T] \\\ &= E\[A e\_{k-1} e\_{k-1}^T A^T + A e\_{k-1} w\_{k-1}^T + w\_{k-1} e\_{k-1}^T A^T + w\_{k-1} w\_{k-1}^T] \\\ &= A E\[e\_{k-1} e\_{k-1}^T] A^T + E\[w\_{k-1} w\_{k-1}^T] \\\ &= A P\_{k-1} A^T + Q \end{aligned}\
\$\$



为计算后验P\_k = E\[e\_k e\_k^T]，先算e\_k:

\$\$\
\begin{aligned} e\_k &= x\_k - \hat{x}\_k \\\ &= x\_k - (\hat{x}\_k^- + K\_k(z\_k - H \hat{x}\_k^-)) \\\ &= x\_k - (\hat{x}\_k^- + K\_k((H x\_k + v\_k) - H \hat{x}\_k^-))\\\ &= (I - K\_k H) e\_k^- - K\_k v\_k \end{aligned}\
\$\$



\$\$\
\begin{aligned} P\_k &= E\[e\_k e\_k^T] \\\ &= E\[((I - K\_k H) e\_k^- - K\_k v\_k) ((I - K\_k H) e\_k^- - K\_k v\_k)^T]\\\ &=(I - K\\\_k H) E\[e\_k^- (e\\\_k^-)^T] (I - K\\\_k H)^T- (I - K\_k H) E\[e\_k^- v\_k^T] K\_k^T- K\_k E\[v\_k (e\_k^-)^T] (I - K\_k H)^T+ K\_k E\[v\_k v\_k^T] K\_k^T \\\ &= (I - K\_k H) P\_k^- (I - K\_k H)^T - 0 - 0 + K\_k R K\_k^T\\\ &= (I - K\_k H) P\_k^- (I - K\_k H)^T + K\_k R K\_k^T \end{aligned}\
\$\$



我们希望系统各个状态变量的误差越小越好，协方差矩阵对角线上的元素是各个变量的方差。因此要让 P\_k 对角线元素之和，即矩阵的迹最小化。

根据\frac{\partial Tr(AB)}{\partial A} = B^T，\frac{\partial Tr(A B A^T)}{\partial A} = 2 A B

\$\$\
\begin{aligned} J &= Tr(P\_k) \\\ &= Tr(P\_k^- - K\_k H P\_k^- - P\_k^- H^T K\_k^T + K\_k H P\_k^- H^T K\_k^T + K\_k R K\_k^T)\\\ &= Tr(P\_k^-) - 2 Tr(K\_k H P\_k^-) + Tr(K\_k (H P\_k^- H^T + R) K\_k^T)\\\ &= -2 P\_k^- H^T + 2 K\_k (H P\_k^- H^T + R) \end{aligned}\
\$\$



令\frac{\partial J}{\partial K\_k} = 0，

\$\$\
K\_k = P\_k^- H^T (H P\_k^- H^T + R)^{-1}\
\$\$



这便是卡尔曼滤波的增益公式。

##### **性质**

如果观测矩阵 H=I ，此时最优卡尔曼增益变为 K = \frac{P^-}{P^- + R}。代入协方差更新方程 P = (1 - K)P^-可得\frac{1}{P} = \frac{1}{P^-} + \frac{1}{R}。说明融合后的精确度（方差的倒数）等于预测精确度与测量精确度之和，独立信息源的叠加将导致总不确定度越融合越小。

卡尔曼滤波的本质是将两个数据源通过协方差更小这个条件进行校准，更接近真实值。

### **扩展卡尔曼滤波**

现实系统往往是非线性函数。EKF扩展卡尔曼滤波通过泰勒展开取非线性函数的一阶泰勒展开继续使用卡尔曼滤波。

将非线性的状态转移函数记为 f，观测函数记为h可以得到：

\$\$\
\left\\{ \begin{aligned} h:x\_k &= f(x\_{k-1}, u\_{k-1}) + w\_{k-1}\\\ z\_k &= h(x\_k) + v\_k \end{aligned} \right.\
\$\$



进行泰勒展开：

\$\$\
f(x\_{k-1}, u\_{k-1}) \approx f(\hat{x}\_{k-1}, u\_{k-1}) + F\_k (x\_{k-1} - \hat{x}\_{k-1})，其中F\_k = \frac{\partial f}{\partial x} \Bigg|\_{\hat{x}\_{k-1}, u\_{k-1}}\\\ h(x\_k) \approx h(\hat{x}\_k^-) + H\_k (x\_k - \hat{x}\_k^-)，其中H\_k = \frac{\partial h}{\partial x} \Bigg|\_{\hat{x}\_k^-}\
\$\$



| **特性**    | **标准卡尔曼滤波**                               | **扩展卡尔曼滤波(EKF)**                                                              |
| :-------- | :---------------------------------------- | :---------------------------------------------------------------------------- |
| **系统模型**  | 矩阵 A, B, H 是常量或仅随时间变化                     | 函数 f(x), h(x) 是非线性的                                                           |
| **状态预测**  | \hat{x}\_k^- = A\hat{x}\_{k-1}            | \hat{x}\_k^- = f(\hat{x}\_{k-1}, u\_{k-1}) **(用原函数)**                         |
| **协方差传递** | P\_k^- = A P\_{k-1} A^T + Q               | P\_k^- = \mathbf{F\_k} P\_{k-1} \mathbf{F\_k}^T + Q                           |
| **增益计算**  | K\_k = P\_k^- H^T (H P\_k^- H^T + R)^{-1} | K\_k = P\_k^- \mathbf{H\_k}^T (\mathbf{H\_k} P\_k^- \mathbf{H\_k}^T + R)^{-1} |
| **更新残差**  | z\_k - H\hat{x}\_k^-                      | z\_k - h(\hat{x}\_k^-) **(用原函数)**                                             |

<br />

