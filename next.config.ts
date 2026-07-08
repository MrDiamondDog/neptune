import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	headers() {
		return [{
			source: "/api/ical/:userId*",
			headers: [
				{ key: "Access-Control-Allow-Credentials", value: "true" },
				{ key: "Access-Control-Allow-Origin", value: "*" },
				{ key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
				{ key: "Access-Control-Allow-Headers", value: "Accept, Accept-Version, Content-Length, Content-Type, Authorization" },
			]
		}]
	}
};

export default nextConfig;
