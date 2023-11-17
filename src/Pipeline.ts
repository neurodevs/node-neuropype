import fs from 'fs'
import { assertOptions } from '@sprucelabs/schema'
import axios, { Axios } from 'axios'
import SpruceError from './errors/SpruceError'

export default class Pipeline {
	public static axios: Axios = axios
	public static Class: new (options: PipelineConstructorOptions) => Pipeline

	private baseUrl: string
	private executionId?: string

	protected constructor(options: PipelineConstructorOptions) {
		const { baseUrl } = options
		this.baseUrl = baseUrl
	}

	public static async Pipeline(options: PipelineOptions) {
		const { path } = assertOptions(options, ['path'])

		const baseUrl = process.env.NEUROPYPE_BASE_URL
		if (!baseUrl) {
			throw new SpruceError({ code: 'MISSING_NEUROPYPE_BASE_URL_ENV' })
		}

		if (!fs.existsSync(path)) {
			throw new SpruceError({ path, code: 'PIPELINE_NOT_FOUND' })
		}

		const pipeline = new (this.Class ?? this)({ baseUrl })

		await pipeline.createExecution()

		return pipeline
	}

	protected get executionUrl() {
		return `${this.baseUrl}/executions/${this.executionId}`
	}

	private async createExecution() {
		const { data } = await this.axios.post(this.baseUrl + '/executions')
		const { id } = data
		this.executionId = id
	}

	private get axios() {
		return Pipeline.axios
	}

	public async start() {
		await this.axios.post(this.executionUrl, {
			running: true,
			paused: false,
		})
	}

	public async stop() {
		await this.axios.patch(this.executionUrl, {
			running: false,
		})
	}

	public async reset() {
		await this.axios.delete(this.executionUrl)
		await this.createExecution()
	}

	public async update(_parameters: Record<string, any>) {}
}

interface PipelineOptions {
	path: string
}

interface PipelineConstructorOptions {
	baseUrl: string
}
