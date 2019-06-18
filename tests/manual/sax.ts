import * as sax from 'sax';

export function run(): void {
	const xml = `ab<Toto/>`;
	const parser = sax.parser(true);
	parser.onopentag = tag => {
		console.log('ononpentag', tag.name);
	};
	parser.onclosetag = tag => {
		console.log('onclosetag', tag);
	};
	parser.onattribute = attr => {
		console.log('onattribute', attr);
	};
	parser.onerror = err => {
		console.log('onerror', err.message.split('\n')[0]);
		parser.resume();
	};
	parser.write(xml).close();
}