import {
	BANNER_HEIGHT,
	BANNER_HEIGHT_EXTEND,
	BANNER_HEIGHT_HOME,
	MAIN_PANEL_OVERLAPS_BANNER_HEIGHT,
} from "../constants/constants";

export function initScrollHandler() {
	const backToTopBtn = document.getElementById("back-to-top-btn");
	const toc = document.getElementById("toc-wrapper");
	const navbar = document.getElementById("navbar-wrapper");
	const bannerEnabled = !!document.getElementById("banner-wrapper");

	function scrollFunction() {
		const bannerHeight = window.innerHeight * (BANNER_HEIGHT / 100);

		if (backToTopBtn) {
			if (
				document.body.scrollTop > bannerHeight ||
				document.documentElement.scrollTop > bannerHeight
			) {
				backToTopBtn.classList.remove("hide");
			} else {
				backToTopBtn.classList.add("hide");
			}
		}

		if (bannerEnabled && toc) {
			if (
				document.body.scrollTop > bannerHeight ||
				document.documentElement.scrollTop > bannerHeight
			) {
				toc.classList.remove("toc-hide");
			} else {
				toc.classList.add("toc-hide");
			}
		}

		if (!bannerEnabled) return;
		if (navbar) {
			const NAVBAR_HEIGHT = 72;
			const MAIN_PANEL_EXCESS_HEIGHT = MAIN_PANEL_OVERLAPS_BANNER_HEIGHT * 16;

			let usedBannerHeight = BANNER_HEIGHT;
			if (
				document.body.classList.contains("lg:is-home") &&
				window.innerWidth >= 1024
			) {
				usedBannerHeight = BANNER_HEIGHT_HOME;
			}
			const threshold =
				window.innerHeight * (usedBannerHeight / 100) -
				NAVBAR_HEIGHT -
				MAIN_PANEL_EXCESS_HEIGHT -
				16;
			if (
				document.body.scrollTop >= threshold ||
				document.documentElement.scrollTop >= threshold
			) {
				navbar.classList.add("navbar-hidden");
			} else {
				navbar.classList.remove("navbar-hidden");
			}
		}
	}
	window.onscroll = scrollFunction;

	window.onresize = () => {
		// calculate the --banner-height-extend, which needs to be a multiple of 4 to avoid blurry text
		let offset = Math.floor(window.innerHeight * (BANNER_HEIGHT_EXTEND / 100));
		offset = offset - (offset % 4);
		document.documentElement.style.setProperty(
			"--banner-height-extend",
			`${offset}px`,
		);
	};
}
