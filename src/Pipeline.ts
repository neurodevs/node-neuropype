import { assertOptions } from '@sprucelabs/schema'
import { buildLog } from '@sprucelabs/spruce-skill-utils'
import axios, { Axios } from 'axios'
import SpruceError from './errors/SpruceError'

export default class PipelineImpl implements Pipeline {
	public static axios: Axios = axios
	public static Class: new (options: PipelineConstructorOptions) => Pipeline

	private baseUrl: string
	private path: string
	private executionId?: string
	private log = buildLog('PipelineImpl')

	public static async Pipeline(options: PipelineOptions) {
		const { path } = assertOptions(options, ['path'])
		const baseUrl = process.env.NEUROPYPE_BASE_URL

		if (!baseUrl) {
			throw new SpruceError({ code: 'MISSING_NEUROPYPE_BASE_URL_ENV' })
		}

		if (!path.endsWith('.pyp')) {
			throw new SpruceError({ path, code: 'INVALID_PIPELINE_FORMAT' })
		}

		const pipeline = new (this.Class ?? this)({ baseUrl, path })

		await pipeline.load()

		return pipeline
	}

	protected constructor(options: PipelineConstructorOptions) {
		const { baseUrl, path } = options
		this.baseUrl = baseUrl
		this.path = path
	}

	private async createExecution() {
		const { data } = await this.post(this.baseUrl + '/executions', {})
		const { id } = data
		this.executionId = id
	}

	protected get executionUrl() {
		return `${this.baseUrl}/executions/${this.executionId}`
	}

	public async load() {
		await this.createExecution()
		await this.post(`${this.executionUrl}/actions/load`, {
			file: this.path,
			what: 'graph',
		})
	}

	private async post(url: string, args?: Record<string, any>) {
		try {
			return await this.axios.post(url, args)
		} catch (err) {
			this.log.error('Failed to load pipeline', this.path)
			throw err
		}
	}

	public async start() {
		await this.patch(this.executionUrl, {
			running: true,
			paused: false,
		})
	}

	private async patch(url: string, args?: Record<string, any>) {
		try {
			return await this.axios.patch(url, args)
		} catch (err) {
			this.log.error('Failed to patch pipeline', this.path)
			throw err
		}
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

	private get axios() {
		return PipelineImpl.axios
	}
}

interface PipelineOptions {
	path: string
}

export interface PipelineConstructorOptions {
	baseUrl: string
	path: string
}

export interface Pipeline {
	load(): unknown
	start(): Promise<void>
	stop(): Promise<void>
	reset(): Promise<void>
	update(parameters: Record<string, any>): Promise<void>
}
