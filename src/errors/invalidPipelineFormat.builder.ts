import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'invalidPipelineFormat',
    name: 'Invalid pipeline format!',
    fields: {
        path: {
            type: 'text',
            isRequired: true,
        },
    },
})
