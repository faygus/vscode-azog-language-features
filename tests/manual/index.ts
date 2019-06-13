import { getScopeForPosition } from '../../lib/utils/parsing/parse-at-position';

/*const xml = `<Layout direction="row">
	<Label    text = "hey"/>
</Layout>`;*/

const xml = `<Layout direction="column">
	<Label text =  "hey" color="green">Bonsoir
	</Label>
</Layout>`;

const offset = 52;

getScopeForPosition(xml, offset).then(res => {
	console.log('res', JSON.stringify(res));
});

/*
TODO :
ne pas utiliser sax pour parser du code en cours d'édition
exemple : '<Label tex' n'est pas du xml valide et donc sax ne parsera ni le tag Label,
ni le début d'attribut tex
En revanche dans '<Label text="hey"' l'attribut sera parsé parce qu'il est valide
mais le tag non

algo :
input: [text: string (xml), offset: number]
find last <

*/