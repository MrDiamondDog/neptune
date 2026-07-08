import { toast } from "sonner";

export function error(e: string): string {
	toast.error(e);
	return e;
}

export function throwToast(title: string, e?: string): unknown {
	toast.error(title, { description: e?.toString() ?? undefined });
	throw e ?? title;
}
