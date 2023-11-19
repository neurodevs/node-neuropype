import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const invalidPipelineFormatSchema: SpruceErrors.NodeNeuropype.InvalidPipelineFormatSchema  = {
	id: 'invalidPipelineFormat',
	namespace: 'NodeNeuropype',
	name: 'Invalid pipeline format!',
	    fields: {
	            /** . */
	            'path': {
	                type: 'text',
	                isRequired: true,
	                options: undefined
	            },
	    }
}

SchemaRegistry.getInstance().trackSchema(invalidPipelineFormatSchema)

export default invalidPipelineFormatSchema
