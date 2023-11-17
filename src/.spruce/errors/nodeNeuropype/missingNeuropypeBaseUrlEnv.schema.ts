import { SchemaRegistry } from '@sprucelabs/schema'
import { SpruceErrors } from '../errors.types'



const missingNeuropypeBaseUrlEnvSchema: SpruceErrors.NodeNeuropype.MissingNeuropypeBaseUrlEnvSchema  = {
	id: 'missingNeuropypeBaseUrlEnv',
	namespace: 'NodeNeuropype',
	name: 'Missing NEUROPYPE_BASE_URL env variable!',
	    fields: {
	    }
}

SchemaRegistry.getInstance().trackSchema(missingNeuropypeBaseUrlEnvSchema)

export default missingNeuropypeBaseUrlEnvSchema
