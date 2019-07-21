import { XmlEditionType } from "../../../utils/parsing/types/xml-edition";
import { CompletionString } from "../../../types";

export interface ICompletionInfos {
	scope: XmlEditionType;
	completionStrings: CompletionString[];
}
