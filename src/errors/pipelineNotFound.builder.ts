import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
	id: 'pipelineNotFound',
	name: 'Pipeline not found!',
	fields: {
		path: {
			type: 'text',
			isRequired: true,
		},
	},
})
