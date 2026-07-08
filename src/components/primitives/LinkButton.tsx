export default function LinkButton({ children, onClick, ...props }: { onClick?: () => void } & React.HTMLAttributes<HTMLParagraphElement>) {
	return <p {...props} className={`${props.className ?? ""} text-primary hover:underline cursor-pointer link`} onClick={onClick}>{children}</p>;
}
