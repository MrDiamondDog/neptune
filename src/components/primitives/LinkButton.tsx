export default function LinkButton({ children, onClick }: { onClick?: () => void } & React.PropsWithChildren) {
	return <p className="text-primary hover:underline cursor-pointer link" onClick={onClick}>{children}</p>;
}
