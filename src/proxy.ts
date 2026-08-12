import { NextApiRequest, NextApiResponse } from "next";

import { auth } from "@/auth";

export default function proxy(req: NextApiRequest, res: NextApiResponse) {
	if (process.env.IS_DEMO === "true")
		return;

	return auth(req, res);
}
