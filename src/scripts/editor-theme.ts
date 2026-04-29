// Editor theme functions

export function applyTheme(theme: string) {
	const html = document.documentElement;
	const lightIcon = document.getElementById("theme-icon-light");
	const darkIcon = document.getElementById("theme-icon-dark");

	if (theme === "dark") {
		html.classList.add("dark");
		lightIcon?.classList.remove("hidden");
		darkIcon?.classList.add("hidden");
	} else {
		html.classList.remove("dark");
		lightIcon?.classList.add("hidden");
		darkIcon?.classList.remove("hidden");
	}
}

export function handleThemeToggle() {
	const currentTheme = localStorage.getItem("github_editor_theme") || "light";
	const newTheme = currentTheme === "dark" ? "light" : "dark";
	localStorage.setItem("github_editor_theme", newTheme);
	applyTheme(newTheme);
}

export function loadInitialTheme() {
	const savedTheme = localStorage.getItem("github_editor_theme");
	const systemPrefersDark = window.matchMedia(
		"(prefers-color-scheme: dark)",
	).matches;
	const theme = savedTheme || (systemPrefersDark ? "dark" : "light");
	applyTheme(theme);
}
