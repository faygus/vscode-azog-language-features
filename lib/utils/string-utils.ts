export function antiCapitalize(tag: string): string {
	return tag.charAt(0).toLowerCase() + tag.slice(1);
}

export function capitalize(tag: string): string {
	return tag.charAt(0).toUpperCase() + tag.slice(1);
}
