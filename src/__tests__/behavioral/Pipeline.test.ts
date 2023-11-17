import AbstractSpruceTest, {
	test,
	assert,
	errorAssert,
	generateId,
} from '@sprucelabs/test-utils'
import axios, {
	Axios,
	AxiosDefaults,
	AxiosInterceptorManager,
	AxiosRequestConfig,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from 'axios'
import { Pipeline } from '../../Pipeline'

export default class PipelineTest extends AbstractSpruceTest {
	private static pipeline: Pipeline
	private static emptyPipelinePath: string

	protected static async beforeEach() {
		await super.beforeEach()
		process.env.NEUROPYPE_BASE_URL = generateId()

		this.emptyPipelinePath = this.resolvePath(
			`build/__tests__/pipelines/empty_pipeline.pyp`
		)
		this.pipeline = await Pipeline.Pipeline({ path: this.emptyPipelinePath })
	}

	@test()
	protected static async pipelineHasAxiosReference() {
		assert.isEqual(Pipeline.axios, axios)
	}

	@test()
	protected static async pipelineThrowsWithMissingParams() {
		const err = assert.doesThrow(() => Pipeline.Pipeline())
		errorAssert.assertError(err, 'MISSING_PARAMETERS', { parameters: ['path'] })
	}

	@test()
	protected static async pipelineThrowsWithMissingNeuropypeBaseUrlEnv() {
		delete process.env.NEUROPYPE_BASE_URL
		const err = assert.doesThrow(() =>
			Pipeline.Pipeline({ path: generateId() })
		)
		errorAssert.assertError(err, 'MISSING_NEUROPYPE_BASE_URL_ENV')
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
	protected static async constructingPipelineCreatesExecution() {
		let wasHit
		Pipeline.axios.post = async () => {
			wasHit = true
		}
		await Pipeline.Pipeline({ path: this.emptyPipelinePath })
		assert.isTrue(wasHit)
	}
}

class AxiosStub implements Axios {
	public defaults = {} as AxiosDefaults
	public interceptors = {
		request: {} as AxiosInterceptorManager<InternalAxiosRequestConfig<any>>,
		response: {} as AxiosInterceptorManager<AxiosResponse<any, any>>,
	}
	
	public getUri(_config?: AxiosRequestConfig<any> | undefined): string {
		return generateId()
	}

	public async request<T = any, R = AxiosResponse<T, any>, D = any>(
		_config: AxiosRequestConfig<D>
	): Promise<R> {
		return {} as R
	}

	public async get<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async delete<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async head<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async options<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async post<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_data?: D | undefined,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async put<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_data?: D | undefined,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async patch<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_data?: D | undefined,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async postForm<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_data?: D | undefined,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async putForm<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_data?: D | undefined,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}

	public async patchForm<T = any, R = AxiosResponse<T, any>, D = any>(
		_url: string,
		_data?: D | undefined,
		_config?: AxiosRequestConfig<D> | undefined
	): Promise<R> {
		return {} as R
	}
}
