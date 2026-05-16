import type {
	ExpressiveCodeConfig,
	FriendsConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "Cr's Blog",
	subtitle: "",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 250, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		{
			src: "/favicon/icon.png", // Path of the favicon, relative to the /public directory
			//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
			//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		},
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		{
			name: "网页",
			url: "/webpages/",
			external: false,
		},
		{
			name: "友链",
			url: "/friends/",
			external: false,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "Cr",
	bio: "",
	links: [
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://steamcommunity.com/profiles/76561199024705311",
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Chr0mium24",
		},
	],
};

export const friendsConfig: FriendsConfig = {
	nodes: [
		{
			id: "cgluWxh",
			name: "cgluWxh",
			url: "https://bilibiili.com/",
			avatar: "https://bilibiili.com/images/avatar.jpg",
		},
		{
			id: "Cr",
			name: "Cr",
			url: "https://chr0mium.link/",
			avatar: "https://chr0mium.link/_astro/avatar.DkNk_au9_ZK3DBw.webp",
		},
		{
			id: "0x535a",
			name: "0x535a",
			url: "https://0x535a.cn/",
			avatar: "https://gh.0x535a.cn/stephen-zeng/img/master/avatar.webp",
		},
		{
			id: "realtvop",
			name: "realtvop",
			url: "https://www.realtvop.top/",
			avatar: "https://www.realtvop.top/79362411.jpeg",
		},
		{
			id: "小翁同学",
			name: "小翁同学",
			url: "https://www.kev1nweng.space/",
			avatar: "https://www.kev1nweng.space/avatar.jpg",
		},
		{
			id: "skyzhou",
			name: "skyzhou",
			url: "https://skyzhou.top",
			avatar: "https://avatars.githubusercontent.com/u/62292370",
		},
	],
	connections: [
		["realtvop", "skyzhou"],
		["skyzhou", "realtvop"],
		["Cr", "skyzhou"],
		["skyzhou", "Cr"],
		["小翁同学", "realtvop"],
		["小翁同学", "cgluWxh"],
		["cgluWxh", "小翁同学"],
		["cgluWxh", "skyzhou"],
		["skyzhou", "cgluWxh"],
		["Cr", "cgluWxh"],
		["cgluWxh", "Cr"],
		["Cr", "0x535a"],
		["Cr", "realtvop"],
		["skyzhou", "0x535a"],
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};
