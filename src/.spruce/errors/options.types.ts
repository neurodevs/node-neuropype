import { SpruceErrors } from "#spruce/errors/errors.types"
import { ErrorOptions as ISpruceErrorOptions} from "@sprucelabs/error"

export interface PipelineNotFoundErrorOptions extends SpruceErrors.NodeNeuropype.PipelineNotFound, ISpruceErrorOptions {
	code: 'PIPELINE_NOT_FOUND'
}
export interface MissingNeuropypeBaseUrlEnvErrorOptions extends SpruceErrors.NodeNeuropype.MissingNeuropypeBaseUrlEnv, ISpruceErrorOptions {
	code: 'MISSING_NEUROPYPE_BASE_URL_ENV'
}

type ErrorOptions =  | PipelineNotFoundErrorOptions  | MissingNeuropypeBaseUrlEnvErrorOptions 

export default ErrorOptions
