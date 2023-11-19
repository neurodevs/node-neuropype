import AbstractSpruceTest, {
	test,
	assert,
	errorAssert,
	generateId,
} from '@sprucelabs/test-utils'
import Pipeline from '../../Pipeline'
import AxiosStub from '../AxiosStub'

export default class PipelineTest extends AbstractSpruceTest {
	private static pipeline: SpyPipeline
	private static emptyPipelinePath: string
	private static axiosStub: AxiosStub
	private static executionId: string

	protected static async beforeEach() {
		await super.beforeEach()
		process.env.NEUROPYPE_BASE_URL = generateId()

		this.emptyPipelinePath = this.resolvePath(
			`build/__tests__/pipelines/empty_pipeline.pyp`
		)

		this.executionId = generateId()

		this.axiosStub = new AxiosStub()
		Pipeline.Class = SpyPipeline
		Pipeline.axios = this.axiosStub

		delete this.axiosStub.responseToPost
		delete this.axiosStub.lastPatchParams
		delete this.axiosStub.lastDeleteParams
		this.resetLastPostParams()

		this.pipeline = (await Pipeline.Pipeline({
			path: this.emptyPipelinePath,
		})) as SpyPipeline
	}

	@test()
	protected static async pipelineThrowsWithMissingParams() {
		//@ts-ignore
		const err = await assert.doesThrowAsync(() => Pipeline.Pipeline())
		errorAssert.assertError(err, 'MISSING_PARAMETERS', { parameters: ['path'] })
	}

	@test()
	protected static async pipelineThrowsWhenPathDoesNotEndInPyp() {
		const invalidPath = generateId()
		const err = await assert.doesThrowAsync(() => Pipeline.Pipeline({path: invalidPath}))
		errorAssert.assertError(err, 'INVALID_PIPELINE_FORMAT')
	}

	@test()
	protected static async pipelineThrowsWithMissingNeuropypeBaseUrlEnv() {
		delete process.env.NEUROPYPE_BASE_URL
		const err = await assert.doesThrowAsync(() =>
			Pipeline.Pipeline({ path: generateId() })
		)
		errorAssert.assertError(err, 'MISSING_NEUROPYPE_BASE_URL_ENV')
	}

	@test()
	protected static async pipelineThrowsWithPipelineNotFound() {
		const pipelinePath = `${generateId()}.pyp`
		const err = await assert.doesThrowAsync(() =>
			Pipeline.Pipeline({ path: pipelinePath })
		)
		errorAssert.assertError(err, 'PIPELINE_NOT_FOUND', { path: pipelinePath })
	}

	@test()
	protected static async constructingPipelineCreatesExecution() {
		await Pipeline.Pipeline({ path: this.emptyPipelinePath })
		assert.isEqualDeep(this.axiosStub.lastPostParams, {
			url: `${process.env.NEUROPYPE_BASE_URL}/executions`,
			data: undefined,
			config: undefined,
		})
	}

	@test()
	protected static async canRunPipeline() {
		await this.pipeline.run()
		assert.isEqualDeep(this.axiosStub.lastPostParams, {
			url: this.executionUrl,
			config: undefined,
			data: {
				running: true,
				paused: false,
			},
		})
	}

	@test()
	protected static async canStopPipeline() {
		await this.pipeline.stop()
		assert.isEqualDeep(this.axiosStub.lastPatchParams, {
			url: this.executionUrl,
			config: undefined,
			data: {
				running: false,
			},
		})
	}

	@test()
	protected static async resetKillsExecution() {
		await this.pipeline.reset()
		assert.isEqualDeep(this.axiosStub.lastDeleteParams, {
			url: this.executionUrl,
		})
	}

	@test()
	protected static async resetStartsNewExecution() {
		this.executionId = generateId()
		this.resetLastPostParams()

		await this.pipeline.reset()

		assert.isEqualDeep(this.axiosStub.lastPostParams, {
			url: `${process.env.NEUROPYPE_BASE_URL}/executions`,
			data: undefined,
			config: undefined,
		})

		assert.isEqual(this.pipeline.getExecutionUrl(), this.executionUrl)
	}

	@test()
	protected static async canUpdateParams() {
		await this.pipeline.update({
			hello: 'world',
		})
	}

	// @property
    // def load_url(self):
    //     """ Generates the URL for loading pipelines """
    //     return posixpath.join(self.execution_id_url, 'actions/load')
    // def _load_pipeline(self):
    //     """ Loads a pipeline into the running execution """
    //     properties = {'file': self.pipeline_path, 'what': 'graph'}
    //     response = requests.post(self.load_url, json=properties)
    //     logger.debug(f'Loaded {self.name} pipeline...')
    //     logger.debug(f'Received response: {response}...')

	private static resetLastPostParams() {
		delete this.axiosStub.lastPostParams
		this.fakeCreateExecution()
	}
	
	private static fakeCreateExecution() {
		this.axiosStub.responseToPost = {
			data: {
				id: this.executionId,
			},
			config: {} as any,
			status: 200,
			statusText: 'OK',
			headers: {},
		}
	}

	private static get executionUrl() {
		return `${process.env.NEUROPYPE_BASE_URL}/executions/${this.executionId}`
	}
}

class SpyPipeline extends Pipeline {
	public constructor(...args: any[]) {
		//@ts-ignore
		super(...args)
	}

	public getExecutionUrl() {
		return this.executionUrl
	}
}
