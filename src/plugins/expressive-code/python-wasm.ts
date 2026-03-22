import { Buffer } from "node:buffer";
import { definePlugin } from "@expressive-code/core";
import { h } from "hastscript";

const PYTHON_LANGUAGES = new Set(["python", "py"]);

function normalizePythonLanguage(language: string): string {
	const normalized = language.trim().toLowerCase();
	if (PYTHON_LANGUAGES.has(normalized)) return "python";
	return language;
}

function parsePackages(value: string | undefined): string[] {
	if (!value) return [];
	return value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
}

export function pluginPythonWasm() {
	return definePlugin({
		name: "Python WASM Runner",
		hooks: {
			preprocessLanguage: (context) => {
				const normalizedLanguage = normalizePythonLanguage(
					context.codeBlock.language,
				);
				if (normalizedLanguage !== context.codeBlock.language) {
					context.codeBlock.language = normalizedLanguage;
				}
			},
			postprocessRenderedBlock: (context) => {
				const language = normalizePythonLanguage(context.codeBlock.language);
				if (language !== "python") return;

				if (!context.codeBlock.metaOptions.getBoolean("run")) return;

				const packages = parsePackages(
					context.codeBlock.metaOptions.getString("packages"),
				);
				const encodedCode = Buffer.from(context.codeBlock.code, "utf8").toString(
					"base64",
				);
				const properties = context.renderData.blockAst.properties || {};
				const existingClassNames = Array.isArray(properties.className)
					? properties.className
					: properties.className !== undefined
						? [properties.className]
						: [];
				const classNames = existingClassNames.filter(
					(className): className is string | number =>
						typeof className === "string" || typeof className === "number",
				);

				context.renderData.blockAst.properties = {
					...properties,
					className: [...classNames, "python-wasm-block"],
					"data-python-wasm": "",
					"data-python-state": "idle",
					"data-python-code": encodedCode,
					...(packages.length > 0
						? { "data-python-packages": packages.join(",") }
						: {}),
				};

				context.renderData.blockAst.children.push(
					h("div.python-wasm-panel", [
						h("div.python-wasm-toolbar", [
							h(
								"button.python-wasm-run-btn",
								{
									type: "button",
									"data-python-run": "",
								},
								"运行",
							),
							h(
								"button.python-wasm-clear-btn",
								{
									type: "button",
									"data-python-clear": "",
								},
								"清空输出",
							),
							h(
								"span.python-wasm-status",
								{
									"data-python-status": "",
								},
								packages.length > 0
									? `浏览器内 Python (Pyodide) · packages: ${packages.join(", ")}`
									: "浏览器内 Python (Pyodide)",
							),
						]),
						h(
							"pre.python-wasm-output",
							{
								"data-python-output": "",
								"aria-live": "polite",
							},
							"点击“运行”后会在浏览器内执行这段 Python 代码。",
						),
					]),
				);
			},
		},
	});
}
