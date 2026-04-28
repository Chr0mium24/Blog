import "overlayscrollbars/overlayscrollbars.css";
import { OverlayScrollbars } from "overlayscrollbars";

function processKatexElement(element: HTMLElement) {
	if (!element.parentNode) return;
	if (element.hasAttribute("data-scrollbar-initialized")) return;

	const container = document.createElement("div");
	container.className = "katex-display-container";
	container.setAttribute("aria-label", "scrollable container for formulas");

	element.parentNode.insertBefore(container, element);
	container.appendChild(element);

	OverlayScrollbars(container, {
		scrollbars: {
			theme: "scrollbar-base scrollbar-auto",
			autoHide: "leave",
			autoHideDelay: 500,
			autoHideSuspend: false,
		},
	});

	element.setAttribute("data-scrollbar-initialized", "true");
}

const katexObserverOptions = {
	root: null,
	rootMargin: "100px",
	threshold: 0.1,
};

let katexObserver: IntersectionObserver | null = null;

export function initCustomScrollbar() {
	const bodyElement = document.querySelector("body");
	if (!bodyElement) return;
	OverlayScrollbars(
		{
			target: bodyElement,
			cancel: {
				nativeScrollbarsOverlaid: true,
			},
		},
		{
			scrollbars: {
				theme: "scrollbar-base scrollbar-auto py-1",
				autoHide: "move",
				autoHideDelay: 500,
				autoHideSuspend: false,
			},
		},
	);

	const katexElements = document.querySelectorAll(
		".katex-display",
	) as NodeListOf<HTMLElement>;

	katexObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				processKatexElement(entry.target as HTMLElement);
				observer.unobserve(entry.target);
			}
		});
	}, katexObserverOptions);

	katexElements.forEach((element) => {
		katexObserver?.observe(element);
	});
}
