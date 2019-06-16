import { computeCompletion } from '../../lib/features/completion/compute';
import documentRules from '../../lib/language/language-specifications';

export async function run(): Promise<void> {
	const xml = `<LabelWF text="hey"/>`;
	const offset = 10;
	const res = await computeCompletion(xml, offset, documentRules);
	console.log('res', res);
}
