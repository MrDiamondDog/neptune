export default function NodeList({ nodes }: { nodes: React.ReactNode[] }): React.ReactNode {
	if (nodes.length === 1)
		return nodes[0];
	if (nodes.length === 2)
		return <>{nodes[0]} and {nodes[1]}</>;

	let node = <></>;
	for (let i = 0; i < nodes.length; i++)
		node = <>{node}{nodes[i]}{(i === nodes.length - 1 ? "" : (i === nodes.length - 2 ? ", and " : ", "))}</>;
	return node;
}
