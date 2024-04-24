import { buildErrorSchema } from '@sprucelabs/schema'

export default buildErrorSchema({
    id: 'missingNeuropypeBaseUrlEnv',
    name: 'Missing NEUROPYPE_BASE_URL env variable!',
    fields: {},
})
