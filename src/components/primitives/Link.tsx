import { ExternalLink } from "lucide-react";

export default function Link({ external, ...props }: { external?: boolean } & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
	return <a {...props} className={`${props.className ?? ""} flex gap-1 items-center link`}>
		<p>{props.children}</p>
		<ExternalLink size={16} />
	</a>;
}
