export function titleCase(str: string) {
	return str.toLowerCase().split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}

export function list(...strs: string[]) {
	if (strs.length === 1)
		return strs[0];
	if (strs.length === 2)
		return `${strs[0]} and ${strs[1]}`;

	let res = "";
	for (let i = 0; i < strs.length; i++)
		res += `${strs[i]}${(i === strs.length - 1 ? "" : (i === strs.length - 2 ? ", and " : ", "))}`;
	return res;
}
