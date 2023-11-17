import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const pipelineNotFoundSchema: SpruceErrors.NodeNeuropype.PipelineNotFoundSchema  = {
	id: 'pipelineNotFound',
	namespace: 'NodeNeuropype',
	name: 'Pipeline not found!',
	    fields: {
	            /** . */
	            'path': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(pipelineNotFoundSchema)

export default pipelineNotFoundSchema
