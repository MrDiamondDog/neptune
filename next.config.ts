import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: process.env.NODE_ENV === "production" ? "standalone" : undefined,
	allowedDevOrigins: ['172.20.10.3'],
	headers() {
		return [{
			source: "/api/ical/:userId*",
			headers: [
				{ key: "Access-Control-Allow-Credentials", value: "true" },
				{ key: "Access-Control-Allow-Origin", value: "*" },
				{ key: "Access-Control-Allow-Methods", value: "GET,OPTIONS" },
				{ key: "Access-Control-Allow-Headers", value: "Accept, Accept-Version, Content-Length, Content-Type, Authorization" },
			]
		},
		{
	        source: '/(.*)',
	        headers: [
	          {
	            key: 'X-Content-Type-Options',
	            value: 'nosniff',
	          },
	          {
	            key: 'X-Frame-Options',
	            value: 'DENY',
	          },
	          {
	            key: 'Referrer-Policy',
	            value: 'strict-origin-when-cross-origin',
	          },
	        ],
	      },
	      {
	        source: '/sw.js',
	        headers: [
	          {
	            key: 'Content-Type',
	            value: 'application/javascript; charset=utf-8',
	          },
	          {
	            key: 'Cache-Control',
	            value: 'no-cache, no-store, must-revalidate',
	          },
	          {
	            key: 'Content-Security-Policy',
	            value: "default-src 'self'; script-src 'self'",
	          },
	        ],
    	  }]
	},
};

export default nextConfig;
