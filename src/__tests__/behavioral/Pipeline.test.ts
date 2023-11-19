import AbstractSpruceTest, {
	test,
	assert,
	errorAssert,
	generateId,
} from '@sprucelabs/test-utils'
import PipelineImpl from '../../Pipeline'
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

		PipelineImpl.Class = SpyPipeline
		PipelineImpl.axios = this.axiosStub

		delete this.axiosStub.responseToPost
		delete this.axiosStub.lastPatchParams
		delete this.axiosStub.lastDeleteParams
		this.resetLastPostParams()

		this.pipeline = (await PipelineImpl.Pipeline({
			path: this.emptyPipelinePath,
		})) as SpyPipeline
	}

	@test()
	protected static async throwsWithMissingParams() {
		//@ts-ignore
		const err = await assert.doesThrowAsync(() => PipelineImpl.Pipeline())
		errorAssert.assertError(err, 'MISSING_PARAMETERS', { parameters: ['path'] })
	}

	@test()
	protected static async throwsWhenPathDoesNotEndInPyp() {
		const invalidPath = generateId()
		const err = await assert.doesThrowAsync(() =>
			PipelineImpl.Pipeline({ path: invalidPath })
		)
		errorAssert.assertError(err, 'INVALID_PIPELINE_FORMAT', {
			path: invalidPath,
		})
	}

	@test()
	protected static async throwsWithPipelineNotFound() {
		const missingPath = `${generateId()}.pyp`
		const err = await assert.doesThrowAsync(() =>
			PipelineImpl.Pipeline({ path: missingPath })
		)
		errorAssert.assertError(err, 'PIPELINE_NOT_FOUND', { path: missingPath })
	}

	@test()
	protected static async throwsWithMissingEnv() {
		delete process.env.NEUROPYPE_BASE_URL
		const err = await assert.doesThrowAsync(() =>
			PipelineImpl.Pipeline({ path: generateId() })
		)
		errorAssert.assertError(err, 'MISSING_NEUROPYPE_BASE_URL_ENV')
	}

	@test()
	protected static async creatingPipelineCreatesExecutionAndLoadsPipeline() {
		await PipelineImpl.Pipeline({ path: this.emptyPipelinePath })

		const createExecutionParams = this.axiosStub.postParamsHistory[0]
		assert.isEqualDeep(createExecutionParams, {
			url: `${process.env.NEUROPYPE_BASE_URL}/executions`,
			data: undefined,
			config: undefined,
		})

		const loadParams = this.axiosStub.postParamsHistory[1]
		assert.isEqualDeep(loadParams, {
			url: `${this.executionUrl}/actions/load`,
			config: undefined,
			data: {
				file: this.emptyPipelinePath,
				what: 'graph',
			},
		})
	}

	@test()
	protected static async canRunPipeline() {
		await this.pipeline.start()

		const runParams = this.axiosStub.postParamsHistory[2]
		assert.isEqualDeep(runParams, {
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

		const createExecutionParams = this.axiosStub.postParamsHistory[0]
		assert.isEqualDeep(createExecutionParams, {
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
		this.axiosStub.postParamsHistory = []
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

class SpyPipeline extends PipelineImpl {
	public constructor(...args: any[]) {
		//@ts-ignore
		super(...args)
	}

	public getExecutionUrl() {
		return this.executionUrl
	}
}
