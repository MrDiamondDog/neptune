import { ExternalLink } from "lucide-react";

export default function Link({ external, ...props }: { external?: boolean } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
	return <a {...props} className={`${props.className ?? ""} flex gap-1 items-center link`}>
		{props.children}
		<ExternalLink size={16} />
	</a>;
}
