export function deleteFromArray<T>(arr: T[], item: T, idKey?: keyof T): T[] {
    const i = idKey ? arr.findIndex(o => o[idKey] === item[idKey]) : arr.indexOf(item);
    if (i === -1)
        return arr;
    return [...arr.slice(0, i), ...arr.slice(i + 1)];
}

export function modifyArrayItem<T>(arr: T[], item: T, idKey?: keyof T): T[] {
    const i = idKey ? arr.findIndex(o => o[idKey] === item[idKey]) : arr.indexOf(item);
    if (i === -1)
        return arr;
    return [...arr.slice(0, i), item, ...arr.slice(i + 1)];
}

export function moveArrayItem<T>(arr: T[], index: number, dir: "up" | "down"): T[] {
    if (dir === "up" && index === 0)
        return arr;
    if (dir === "down" && index === arr.length - 1)
        return arr;

    const newArr = [...arr];

    if (dir === "up")
        [newArr[index - 1], newArr[index]] = [newArr[index], newArr[index - 1]];
    if (dir === "down")
        [newArr[index], newArr[index + 1]] = [newArr[index + 1], newArr[index]];

    return newArr;
}

/**
 * Concatenates strings into a human-readable list.
 * [a, b, c] => "a, b, and c"
 */
export function stringsToList(strings: string[]): string {
	if (strings.length === 1)
		return strings[0];
	if (strings.length === 2)
		return `${strings[0]} and ${strings[1]}`;

	let str = "";
	for (let i = 0; i < strings.length; i++)
		str += strings[i] + (i === strings.length - 1 ? "" : (i === strings.length - 2 ? ", and " : ", "));
	return str;
}

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

	return array;
}
