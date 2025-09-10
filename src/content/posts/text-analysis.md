---
title: 文本编辑
published: 2025-09-10
updated: 2025-09-10
description: ""
tags: []
category: 代码
---

<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>深度中文文本特征对比分析</title>
    <!-- 引入Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- 引入Chart.js 用于绘图 -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <!-- 引入Chart.js的箱形图插件 -->
    <script src="https://cdn.jsdelivr.net/npm/@sgratzl/chartjs-chart-boxplot@4.2.0/build/index.umd.min.js"></script>
    <!-- 引入LZ-String库 用于计算压缩率 -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js"></script>
  </head>
  <div class="bg-gray-100 font-sans">
    <div class="container mx-auto p-4 md:p-8">
      <header class="text-center mb-8">
        <h1 class="text-3xl md:text-4xl font-bold text-gray-800">
          深度中文文本特征对比分析
        </h1>
        <p class="text-gray-600 mt-2">
          从词汇、句法、内容、风格等多个维度，对两段中文文本进行全面量化与可视化对比。
        </p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label for="textA" class="block text-lg font-medium text-gray-700"
            >文本 A (蓝色)</label
          >
          <textarea
            id="textA"
            rows="12"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-3"
            placeholder="请在此处粘贴第一段中文文本..."
          ></textarea>
        </div>
        <div>
          <label for="textB" class="block text-lg font-medium text-gray-700"
            >文本 B (红色)</label
          >
          <textarea
            id="textB"
            rows="12"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base p-3"
            placeholder="请在此处粘贴第二段中文文本..."
          ></textarea>
        </div>
      </div>

      <div class="text-center mb-8">
        <button
          id="analyzeBtn"
          class="bg-indigo-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg text-lg"
        >
          开始深度分析
        </button>
      </div>

      <div
        id="results"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <!-- 图表将在这里动态生成 -->
      </div>
    </div>

    <script>
      // --- 文本处理与辅助函数 ---
      const chineseStopWords = new Set([
        "的",
        "了",
        "在",
        "是",
        "我",
        "你",
        "他",
        "她",
        "它",
        "们",
        "这",
        "那",
        "一",
        "个",
        "也",
        "有",
        "和",
        "就",
        "不",
        "人",
        "都",
        "而",
        "及",
        "与",
        "或",
        "之",
        "其",
        "然",
        "虽",
        "斯",
      ]);

      const splitSentences = (text) =>
        text.match(/[^。？！…\n]+[。？！…\n]?/g) || [];

      // 简单的中文分词（此方法仅为演示，精确分析需要专业分词库）
      const tokenize = (text) => {
        // 使用更复杂的正则来尝试匹配中文词语，但仍有限
        const segments = text.split(/([,.;!?。，；！？\s]+)/);
        let tokens = [];
        segments.forEach((seg) => {
          if (!/[,.;!?。，；！？\s]/.test(seg) && seg.length > 0) {
            // 简单的按字符分割作为词的代理
            tokens.push(...seg.split(""));
            // 在一个真实的应用中，这里应该调用一个像Jieba这样的分词API
          }
        });
        // 简单处理：这里我们为了演示，直接按字分割作为token
        return text
          .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "")
          .split("")
          .filter(Boolean);
      };
      const tokenizeForWords = (text) =>
        text
          .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, " ")
          .trim()
          .split(/\s+/)
          .filter(Boolean);

      // --- 指标计算函数集合 ---
      const calculateAllMetrics = (text) => {
        if (!text) return null;
        const tokens = tokenizeForWords(text);
        const sentences = splitSentences(text);
        const windowSize = 50;

        // 词汇指标
        const slidingTTR =
          tokens.length > windowSize
            ? (() => {
                const values = [];
                for (let i = 0; i <= tokens.length - windowSize; i++) {
                  const window = tokens.slice(i, i + windowSize);
                  values.push(new Set(window).size / window.length);
                }
                return values;
              })()
            : [];
        const overallTTR =
          tokens.length > 0 ? new Set(tokens).size / tokens.length : 0;
        const avgWordLength =
          tokens.length > 0
            ? text.replace(/[\s\p{P}]/gu, "").length / tokens.length
            : 0;
        const termFreq = (() => {
          const counts = new Map();
          tokens
            .filter((t) => !chineseStopWords.has(t) && t.length > 1)
            .forEach((t) => counts.set(t, (counts.get(t) || 0) + 1));
          return Array.from(counts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        })();

        // 句法指标
        const sentenceLengths = sentences
          .map((s) => tokenizeForWords(s).length)
          .filter((len) => len > 0);
        const avgSentenceLength =
          sentenceLengths.reduce((a, b) => a + b, 0) /
          (sentenceLengths.length || 1);

        // 风格指标
        const punctuationFreq = {
          "，": (text.match(/，/g) || []).length,
          "。": (text.match(/。/g) || []).length,
          "？": (text.match(/？/g) || []).length,
          "！": (text.match(/！/g) || []).length,
          "、": (text.match(/、/g) || []).length,
        };

        // 篇章与信息论指标
        const lzRate = LZString.compress(text).length / text.length;
        const similarities = (() => {
          if (sentences.length < 2) return [];
          const vocab = new Set(tokens);
          const vocabList = Array.from(vocab);
          const vectors = sentences.map((s) => {
            const sTokens = tokenizeForWords(s);
            const vec = new Array(vocabList.length).fill(0);
            sTokens.forEach((token) => {
              const idx = vocabList.indexOf(token);
              if (idx !== -1) vec[idx]++;
            });
            return vec;
          });
          const cosineSim = (v1, v2) => {
            let dot = 0,
              norm1 = 0,
              norm2 = 0;
            for (let i = 0; i < v1.length; i++) {
              dot += v1[i] * v2[i];
              norm1 += v1[i] ** 2;
              norm2 += v2[i] ** 2;
            }
            if (norm1 === 0 || norm2 === 0) return 0;
            return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
          };
          const sims = [];
          for (let i = 0; i < vectors.length - 1; i++) {
            sims.push(cosineSim(vectors[i], vectors[i + 1]));
          }
          return sims;
        })();

        // 综合指标
        const complexityIndex = avgSentenceLength * avgWordLength;

        return {
          slidingTTR,
          overallTTR,
          avgWordLength,
          termFreq,
          sentenceLengths,
          punctuationFreq,
          lzRate,
          similarities,
          complexityIndex,
        };
      };

      // --- 图表渲染 ---
      const charts = {};
      const createChart = (ctx, config) => {
        const chartId = ctx.canvas.id;
        if (charts[chartId]) charts[chartId].destroy();
        charts[chartId] = new Chart(ctx, config);
      };

      const renderAllCharts = (dataA, dataB) => {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = `
                <!-- Chart Cards -->
                <div class="bg-white p-4 rounded-lg shadow"><h3 class="font-bold text-center mb-2">滑动TTR (词汇丰富度动态)</h3><canvas id="ttrChart"></canvas><p class="text-sm text-gray-500 mt-2 text-center">展示文本各部分用词的多样性。曲线越高，词汇越丰富。</p></div>
                <div class="bg-white p-4 rounded-lg shadow"><h3 class="font-bold text-center mb-2">句子复杂度分布 (句长)</h3><canvas id="lenChart"></canvas><p class="text-sm text-gray-500 mt-2 text-center">箱形图展示句长分布。箱体越高越长，句子结构越复杂。</p></div>
                <div class="bg-white p-4 rounded-lg shadow"><h3 class="font-bold text-center mb-2">相邻句子连贯性</h3><canvas id="simChart"></canvas><p class="text-sm text-gray-500 mt-2 text-center">相邻句子间的关联度。曲线平稳且值高，意味过渡自然。</p></div>
                <div class="bg-white p-4 rounded-lg shadow"><h3 class="font-bold text-center mb-2">整体词汇特征</h3><canvas id="lexicalChart"></canvas><p class="text-sm text-gray-500 mt-2 text-center">对比整体词汇丰富度(TTR)和平均词长(字/词)。</p></div>
                <div class="bg-white p-4 rounded-lg shadow"><h3 class="font-bold text-center mb-2">文体风格 (标点使用)</h3><canvas id="styleChart"></canvas><p class="text-sm text-gray-500 mt-2 text-center">雷达图展示主要标点使用频率，反映写作节奏和情感。</p></div>
                <div class="bg-white p-4 rounded-lg shadow"><h3 class="font-bold text-center mb-2">综合复杂度与信息密度</h3><canvas id="complexChart"></canvas><p class="text-sm text-gray-500 mt-2 text-center">对比文本复杂度指数和信息密度(1-压缩率)。</p></div>
                <div class="bg-white p-4 rounded-lg shadow"><h3 class="font-bold text-center mb-2">内容关键词 (文本A)</h3><canvas id="tfChartA"></canvas><p class="text-sm text-gray-500 mt-2 text-center">文本A中剔除停用词后的高频词。</p></div>
                <div class="bg-white p-4 rounded-lg shadow"><h3 class="font-bold text-center mb-2">内容关键词 (文本B)</h3><canvas id="tfChartB"></canvas><p class="text-sm text-gray-500 mt-2 text-center">文本B中剔除停用词后的高频词。</p></div>
            `;

        // Row 1
        createChart(document.getElementById("ttrChart").getContext("2d"), {
          type: "line",
          data: {
            labels: Array.from(
              {
                length: Math.max(
                  dataA.slidingTTR.length,
                  dataB.slidingTTR.length
                ),
              },
              (_, i) => i
            ),
            datasets: [
              {
                label: "文本A",
                data: dataA.slidingTTR,
                borderColor: "#3B82F6",
                fill: false,
                pointRadius: 0,
              },
              {
                label: "文本B",
                data: dataB.slidingTTR,
                borderColor: "#EF4444",
                fill: false,
                pointRadius: 0,
              },
            ],
          },
        });
        createChart(document.getElementById("lenChart").getContext("2d"), {
          type: "boxplot",
          data: {
            labels: ["文本A", "文本B"],
            datasets: [
              {
                label: "句子长度",
                data: [dataA.sentenceLengths, dataB.sentenceLengths],
                backgroundColor: [
                  "rgba(59, 130, 246, 0.5)",
                  "rgba(239, 68, 68, 0.5)",
                ],
                borderColor: ["#3B82F6", "#EF4444"],
              },
            ],
          },
        });
        createChart(document.getElementById("simChart").getContext("2d"), {
          type: "line",
          data: {
            labels: Array.from(
              {
                length: Math.max(
                  dataA.similarities.length,
                  dataB.similarities.length
                ),
              },
              (_, i) => i + 1
            ),
            datasets: [
              {
                label: "文本A",
                data: dataA.similarities,
                borderColor: "#3B82F6",
                fill: false,
                pointRadius: 1,
              },
              {
                label: "文本B",
                data: dataB.similarities,
                borderColor: "#EF4444",
                fill: false,
                pointRadius: 1,
              },
            ],
          },
        });

        // Row 2
        createChart(document.getElementById("lexicalChart").getContext("2d"), {
          type: "bar",
          data: {
            labels: ["总词汇丰富度 (TTR)", "平均词长 (字/词)"],
            datasets: [
              {
                label: "文本A",
                data: [dataA.overallTTR, dataA.avgWordLength],
                backgroundColor: "rgba(59, 130, 246, 0.7)",
              },
              {
                label: "文本B",
                data: [dataB.overallTTR, dataB.avgWordLength],
                backgroundColor: "rgba(239, 68, 68, 0.7)",
              },
            ],
          },
        });
        const puncLabels = Object.keys(dataA.punctuationFreq);
        createChart(document.getElementById("styleChart").getContext("2d"), {
          type: "radar",
          data: {
            labels: puncLabels,
            datasets: [
              {
                label: "文本A",
                data: Object.values(dataA.punctuationFreq),
                borderColor: "#3B82F6",
                backgroundColor: "rgba(59, 130, 246, 0.2)",
              },
              {
                label: "文本B",
                data: Object.values(dataB.punctuationFreq),
                borderColor: "#EF4444",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
              },
            ],
          },
        });
        createChart(document.getElementById("complexChart").getContext("2d"), {
          type: "bar",
          data: {
            labels: ["复杂度指数", "信息密度"],
            datasets: [
              {
                label: "文本A",
                data: [dataA.complexityIndex, 1 - dataA.lzRate],
                backgroundColor: "rgba(59, 130, 246, 0.7)",
              },
              {
                label: "文本B",
                data: [dataB.complexityIndex, 1 - dataB.lzRate],
                backgroundColor: "rgba(239, 68, 68, 0.7)",
              },
            ],
          },
        });

        // Row 3
        createChart(document.getElementById("tfChartA").getContext("2d"), {
          type: "bar",
          indexAxis: "y",
          data: {
            labels: dataA.termFreq.map((d) => d[0]),
            datasets: [
              {
                label: "词频",
                data: dataA.termFreq.map((d) => d[1]),
                backgroundColor: "rgba(59, 130, 246, 0.7)",
              },
            ],
          },
        });
        createChart(document.getElementById("tfChartB").getContext("2d"), {
          type: "bar",
          indexAxis: "y",
          data: {
            labels: dataB.termFreq.map((d) => d[0]),
            datasets: [
              {
                label: "词频",
                data: dataB.termFreq.map((d) => d[1]),
                backgroundColor: "rgba(239, 68, 68, 0.7)",
              },
            ],
          },
        });
      };

      // --- 主逻辑 ---
      document.getElementById("analyzeBtn").addEventListener("click", () => {
        const textA = document.getElementById("textA").value;
        const textB = document.getElementById("textB").value;
        if (!textA || !textB) {
          alert("请在两个输入框中都粘贴文本。");
          return;
        }

        const dataA = calculateAllMetrics(textA);
        const dataB = calculateAllMetrics(textB);

        renderAllCharts(dataA, dataB);
      });
    </script>
  </div>
</html>
