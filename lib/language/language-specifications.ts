import { tags } from "./resources/tags";
import { XmlDocumentRulesFactory } from "./rules-builder";

/**
 * Specifies all the tags which can be used in the azog language
 */
const documentRules = XmlDocumentRulesFactory.build(tags);

export default documentRules;
