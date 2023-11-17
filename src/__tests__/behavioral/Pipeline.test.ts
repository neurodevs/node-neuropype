import AbstractSpruceTest, {
	test,
	assert,
	errorAssert,
	generateId,
} from '@sprucelabs/test-utils'
import Pipeline from '../../Pipeline'
import AxiosStub from './AxiosStub'

export default class PipelineTest extends AbstractSpruceTest {
	private static pipeline: SpyPipeline
	private static emptyPipelinePath: string
	private static stubAxios: AxiosStub
	private static executionId: string

	protected static async beforeEach() {
		await super.beforeEach()
		process.env.NEUROPYPE_BASE_URL = generateId()

		this.emptyPipelinePath = this.resolvePath(
			`build/__tests__/pipelines/empty_pipeline.pyp`
		)

		this.executionId = generateId()

		this.stubAxios = new AxiosStub()
		Pipeline.Class = SpyPipeline
		Pipeline.axios = this.stubAxios

		delete this.stubAxios.responseToPost
		this.resetLastPostParams()
		delete this.stubAxios.lastPatchParams
		delete this.stubAxios.lastDeleteParams

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
	protected static async pipelineThrowsWithMissingNeuropypeBaseUrlEnv() {
		delete process.env.NEUROPYPE_BASE_URL
		const err = await assert.doesThrowAsync(() =>
			Pipeline.Pipeline({ path: generateId() })
		)
		errorAssert.assertError(err, 'MISSING_NEUROPYPE_BASE_URL_ENV')
	}

	@test()
	protected static async pipelineThrowsWithPipelineNotFound() {
		const pipelinePath = generateId()
		const err = await assert.doesThrowAsync(() =>
			Pipeline.Pipeline({ path: pipelinePath })
		)
		errorAssert.assertError(err, 'PIPELINE_NOT_FOUND', { path: pipelinePath })
	}

	@test()
	protected static async constructingPipelineCreatesExecution() {
		await Pipeline.Pipeline({ path: this.emptyPipelinePath })

		assert.isEqualDeep(this.stubAxios.lastPostParams, {
			url: `${process.env.NEUROPYPE_BASE_URL}/executions`,
			data: undefined,
			config: undefined,
		})
	}

	@test()
	protected static async canStartExecution() {
		await this.pipeline.start()
		assert.isEqualDeep(this.stubAxios.lastPostParams, {
			url: this.executionUrl,
			config: undefined,
			data: {
				running: true,
				paused: false,
			},
		})
	}

	@test()
	protected static async canStopExecution() {
		await this.pipeline.stop()
		assert.isEqualDeep(this.stubAxios.lastPatchParams, {
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
		assert.isEqualDeep(this.stubAxios.lastDeleteParams, {
			url: this.executionUrl,
		})
	}

	@test()
	protected static async resettingStartsNewExecution() {
		this.executionId = generateId()
		this.resetLastPostParams()

		await this.pipeline.reset()

		assert.isEqualDeep(this.stubAxios.lastPostParams, {
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

	private static resetLastPostParams() {
		delete this.stubAxios.lastPostParams
		this.fakeCreateExeuction()
	}

	private static get executionUrl() {
		return `${process.env.NEUROPYPE_BASE_URL}/executions/${this.executionId}`
	}

	private static fakeCreateExeuction() {
		this.stubAxios.responseToPost = {
			data: {
				id: this.executionId,
			},
			config: {} as any,
			status: 200,
			statusText: 'OK',
			headers: {},
		}
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
