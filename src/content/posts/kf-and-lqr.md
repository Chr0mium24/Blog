---
title: LQR与卡尔曼滤波的同构(草稿)
published: 2026-04-19
updated: 2026-04-19
description: ''
tags: []
category: 知识
---

### 卡尔曼滤波

##### 状态方程

$$
\left\{\begin{aligned}
x_k &= A x_{k-1} + B u_{k-1} + w_{k-1}\\
z_k &= H x_k + v_k
\end{aligned}
\right.
$$

其中$w$是外界扰动，协方差记作$Q=E[ww^T]$

$v$是观测误差，协方差记作$R=E[vv^T]$

根据卡尔曼滤波的概率论假设，过程噪声和测量噪声必须是相互独立的白噪声，且服从高斯（正态）分布： $w \sim \mathcal{N}(0, Q)$， $v \sim \mathcal{N}(0, R)$。

各种噪声相互独立，因此：$E[e_k^- v_k^T] = 0$，$E[v_k (e_k^-)^T] = 0$，$E[e_{k} w_{k}^T ]=0$

##### 更新方程

$\hat{x}_k = \hat{x}_k^- + K_k (z_k - H \hat{x}_k^-)$

为什么更新方程长这样呢。考虑两个独立的信息源：一个是基于模型的先验预测分布 $\mathcal{N}(\hat{x}_k^-, P_k^-)$，另一个是传感器的测量分布 $\mathcal{N}(z_k, R)$。根据贝叶斯定理，结合两个独立证据的后验概率等于两个高斯概率密度函数的乘积。两个高斯指数项相加后，

$$
P \propto e^{\left(-\frac{(x - \mu_1)^2}{2\sigma_1^2}\right)} \times e^{\left(-\frac{(x - \mu_2)^2}{2\sigma_2^2}\right)} = e^{-\left(\frac{(x - \mu_1)^2}{2\sigma_1^2} + \frac{(x - \mu_2)^2}{2\sigma_2^2}\right)}
$$

其均值必定呈现出一种线性加权的形式。因此，假设后验状态的线性更新结构：$\hat{x}_k = \hat{x}_k^- + K_k (z_k - H \hat{x}_k^-)$，接下来我们只需通过最小化方差来求解最优的权重矩阵 $K_k$。

$\hat{x}_k^- = A \hat{x}_{k-1} + B u_{k-1}$

$e_k^- = x_k - \hat{x}_k^- = A(x_{k-1} - \hat{x}_{k-1}) + w_{k-1}= A e_{k-1} + w_{k-1}$

把e的协方差记作$P=E[ee^T]$，因此：

$$
\begin{aligned}
P_k^- &= E[e_k^- (e_k^-)^T] \\
&= E[(A e_{k-1} + w_{k-1})(A e_{k-1} + w_{k-1})^T] \\
&= E[A e_{k-1} e_{k-1}^T A^T + A e_{k-1} w_{k-1}^T + w_{k-1} e_{k-1}^T A^T + w_{k-1} w_{k-1}^T] \\
&= A E[e_{k-1} e_{k-1}^T] A^T + E[w_{k-1} w_{k-1}^T] \\
&= A P_{k-1} A^T + Q
\end{aligned}
$$

为计算后验$P_k = E[e_k e_k^T]$，先算$e_k$:

$$
\begin{aligned}
e_k &= x_k - \hat{x}_k \\
&= x_k - (\hat{x}_k^- + K_k(z_k - H \hat{x}_k^-)) \\
&= x_k - (\hat{x}_k^- + K_k((H x_k + v_k) - H \hat{x}_k^-))\\
&= (I - K_k H) e_k^- - K_k v_k
\end{aligned}
$$

$$
\begin{aligned}
P_k &= E[e_k e_k^T] \\
&= E[((I - K_k H) e_k^- - K_k v_k) ((I - K_k H) e_k^- - K_k v_k)^T]\\
&=(I - K\_k H) E[e_k^- (e\_k^-)^T] (I - K\_k H)^T- (I - K_k H) E[e_k^- v_k^T] K_k^T- K_k E[v_k (e_k^-)^T] (I - K_k H)^T+ K_k E[v_k v_k^T] K_k^T \\
&= (I - K_k H) P_k^- (I - K_k H)^T - 0 - 0 + K_k R K_k^T\\
 &= (I - K_k H) P_k^- (I - K_k H)^T + K_k R K_k^T
\end{aligned}
$$

我们希望系统各个状态变量的误差越小越好，协方差矩阵对角线上的元素是各个变量的方差。因此要让 $P_k$ 对角线元素之和，即矩阵的迹最小化。

根据$\frac{\partial Tr(AB)}{\partial A} = B^T$，$\frac{\partial Tr(A B A^T)}{\partial A} = 2 A B$

$$
\begin{aligned}
J &= Tr(P_k) \\
&= Tr(P_k^- - K_k H P_k^- - P_k^- H^T K_k^T + K_k H P_k^- H^T K_k^T + K_k R K_k^T)\\
&= Tr(P_k^-) - 2 Tr(K_k H P_k^-) + Tr(K_k (H P_k^- H^T + R) K_k^T)\\
&= -2 P_k^- H^T + 2 K_k (H P_k^- H^T + R)
\end{aligned}
$$

令$\frac{\partial J}{\partial K_k} = 0$，

$$
K_k = P_k^- H^T (H P_k^- H^T + R)^{-1}
$$

这便是卡尔曼滤波的增益公式。

##### 性质

如果观测矩阵 $H=I$ ，此时最优卡尔曼增益变为 $K = \frac{P^-}{P^- + R}$。代入协方差更新方程 $P = (1 - K)P^-$可得$\frac{1}{P} = \frac{1}{P^-} + \frac{1}{R}$。说明融合后的精确度（方差的倒数）等于预测精确度与测量精确度之和，独立信息源的叠加将导致总不确定度越融合越小。

卡尔曼滤波的本质是将两个数据源通过协方差更小这个条件进行校准，更接近真实值。

### 扩展卡尔曼滤波

现实系统往往是非线性函数。EKF扩展卡尔曼滤波通过泰勒展开取非线性函数的一阶泰勒展开继续使用卡尔曼滤波。

将非线性的状态转移函数记为 $f$，观测函数记为$h$可以得到：

$$
\left\{
\begin{aligned}
h:x_k &= f(x_{k-1}, u_{k-1}) + w_{k-1}\\
z_k &= h(x_k) + v_k
\end{aligned}
\right.
$$

进行泰勒展开：

$$
f(x_{k-1}, u_{k-1}) \approx f(\hat{x}_{k-1}, u_{k-1}) + F_k (x_{k-1} - \hat{x}_{k-1})，其中F_k = \frac{\partial f}{\partial x} \Bigg|_{\hat{x}_{k-1}, u_{k-1}}\\
h(x_k) \approx h(\hat{x}_k^-) + H_k (x_k - \hat{x}_k^-)，其中H_k = \frac{\partial h}{\partial x} \Bigg|_{\hat{x}_k^-}
$$

| **特性**    | **标准卡尔曼滤波**                              | **扩展卡尔曼滤波(EKF)**                                                          |
| :-------- | :--------------------------------------- | :------------------------------------------------------------------------ |
| **系统模型**  | 矩阵 $A, B, H$ 是常量或仅随时间变化                  | 函数 $f(x), h(x)$ 是非线性的                                                     |
| **状态预测**  | $\hat{x}_k^- = A\hat{x}_{k-1}$           | $\hat{x}_k^- = f(\hat{x}_{k-1}, u_{k-1})$ **(用原函数)**                      |
| **协方差传递** | $P_k^- = A P_{k-1} A^T + Q$              | $P_k^- = \mathbf{F_k} P_{k-1} \mathbf{F_k}^T + Q$                         |
| **增益计算**  | $K_k = P_k^- H^T (H P_k^- H^T + R)^{-1}$ | $K_k = P_k^- \mathbf{H_k}^T (\mathbf{H_k} P_k^- \mathbf{H_k}^T + R)^{-1}$ |
| **更新残差**  | $z_k - H\hat{x}_k^-$                     | $z_k - h(\hat{x}_k^-)$ **(用原函数)**                                         |

