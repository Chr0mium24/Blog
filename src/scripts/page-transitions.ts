import { siteConfig } from "../config";
import { BANNER_HEIGHT } from "../constants/constants";
import {
	getHue,
	getStoredTheme,
	setHue,
	setTheme,
} from "../utils/setting-utils";
import { pathsEqual, url } from "../utils/url-utils";
import { initCustomScrollbar } from "./scrollbar-init";

function loadTheme() {
	const theme = getStoredTheme();
	setTheme(theme);
}

function loadHue() {
	setHue(getHue());
}

function showBanner() {
	if (!siteConfig.banner.enable) return;

	const banner = document.getElementById("banner");
	if (!banner) {
		console.error("Banner element not found");
		return;
	}

	banner.classList.remove("opacity-0", "scale-105");
}

export function initPageTransitions() {
	const bannerEnabled = !!document.getElementById("banner-wrapper");

	loadTheme();
	loadHue();
	initCustomScrollbar();
	showBanner();

	const setup = () => {
		window.swup.hooks.on("link:click", () => {
			// Remove the delay for the first time page load
			document.documentElement.style.setProperty("--content-delay", "0ms");

			// prevent elements from overlapping the navbar
			if (!bannerEnabled) {
				return;
			}
			const threshold = window.innerHeight * (BANNER_HEIGHT / 100) - 72 - 16;
			const navbar = document.getElementById("navbar-wrapper");
			if (!navbar || !document.body.classList.contains("lg:is-home")) {
				return;
			}
			if (
				document.body.scrollTop >= threshold ||
				document.documentElement.scrollTop >= threshold
			) {
				navbar.classList.add("navbar-hidden");
			}
		});
		window.swup.hooks.on("content:replace", initCustomScrollbar);
		window.swup.hooks.on("visit:start", (visit: { to: { url: string } }) => {
			// change banner height immediately when a link is clicked
			const bodyElement = document.querySelector("body");
			if (pathsEqual(visit.to.url, url("/"))) {
				bodyElement?.classList.add("lg:is-home");
			} else {
				bodyElement?.classList.remove("lg:is-home");
			}

			// increase the page height during page transition to prevent the scrolling animation from jumping
			const heightExtend = document.getElementById("page-height-extend");
			if (heightExtend) {
				heightExtend.classList.remove("hidden");
			}

			// Hide the TOC while scrolling back to top
			const toc = document.getElementById("toc-wrapper");
			if (toc) {
				toc.classList.add("toc-not-ready");
			}
		});
		window.swup.hooks.on("page:view", () => {
			// hide the temp high element when the transition is done
			const heightExtend = document.getElementById("page-height-extend");
			if (heightExtend) {
				heightExtend.classList.remove("hidden");
			}
		});
		window.swup.hooks.on("visit:end", (_visit: { to: { url: string } }) => {
			setTimeout(() => {
				const heightExtend = document.getElementById("page-height-extend");
				if (heightExtend) {
					heightExtend.classList.add("hidden");
				}

				// Just make the transition looks better
				const toc = document.getElementById("toc-wrapper");
				if (toc) {
					toc.classList.remove("toc-not-ready");
				}
			}, 200);
		});
	};
	if (window?.swup?.hooks) {
		setup();
	} else {
		document.addEventListener("swup:enable", setup);
	}
}
