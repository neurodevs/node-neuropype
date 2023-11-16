import AbstractSpruceTest, {
	test,
	assert,
	errorAssert,
	generateId,
} from '@sprucelabs/test-utils'
import { Pipeline } from '../../Pipeline'

export default class PipelineTest extends AbstractSpruceTest {
	private static pipeline: Pipeline

	protected static async beforeEach() {
		await super.beforeEach()
		const path = this.resolvePath(
			`build/__tests__/pipelines/empty_pipeline.pyp`
		)
		this.pipeline = Pipeline.Pipeline({ path })
	}

	@test()
	protected static async pipelineThrowsWithMissingParams() {
		const err = assert.doesThrow(() => Pipeline.Pipeline())
		errorAssert.assertError(err, 'MISSING_PARAMETERS', { parameters: ['path'] })
	}

	@test()
	protected static async pipelineThrowsWithPipelineNotFound() {
		const pipelinePath = generateId()
		const err = assert.doesThrow(() =>
			Pipeline.Pipeline({ path: pipelinePath })
		)
		errorAssert.assertError(err, 'PIPELINE_NOT_FOUND', { path: pipelinePath })
	}

	@test()
	protected static async loadingPipelineCallsExpectedEndpoint() {
		await this.pipeline.load()
	}
}
