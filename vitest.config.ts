import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
	resolve: {
		alias: {
			"@components": path.resolve(__dirname, "src/components"),
			"@assets": path.resolve(__dirname, "src/assets"),
			"@constants": path.resolve(__dirname, "src/constants"),
			"@utils": path.resolve(__dirname, "src/utils"),
			"@i18n": path.resolve(__dirname, "src/i18n"),
			"@layouts": path.resolve(__dirname, "src/layouts"),
			"@": path.resolve(__dirname, "src"),
		},
	},
	test: {
		include: ["tests/unit/**/*.test.ts"],
	},
});
