import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface PipelineNotFoundErrorOptions extends SpruceErrors.NodeNeuropype.PipelineNotFound, ISpruceErrorOptions {
	code: 'PIPELINE_NOT_FOUND'
}

type ErrorOptions =  | PipelineNotFoundErrorOptions 

export default ErrorOptions
