import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface PipelineNotFoundErrorOptions extends SpruceErrors.NodeNeuropype.PipelineNotFound, ISpruceErrorOptions {
	code: 'PIPELINE_NOT_FOUND'
}
export interface MissingNeuropypeBaseUrlEnvErrorOptions extends SpruceErrors.NodeNeuropype.MissingNeuropypeBaseUrlEnv, ISpruceErrorOptions {
	code: 'MISSING_NEUROPYPE_BASE_URL_ENV'
}
export interface InvalidPipelineFormatErrorOptions extends SpruceErrors.NodeNeuropype.InvalidPipelineFormat, ISpruceErrorOptions {
	code: 'INVALID_PIPELINE_FORMAT'
}

type ErrorOptions =  | PipelineNotFoundErrorOptions  | MissingNeuropypeBaseUrlEnvErrorOptions  | InvalidPipelineFormatErrorOptions 

export default ErrorOptions
