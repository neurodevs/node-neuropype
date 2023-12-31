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

	public async load() {
		await this.createExecution()
		await this.post(`${this.executionIdUrl}/actions/load`, {
			file: this.path,
			what: 'graph',
		})
	}

	public async start() {
		await this.patch(this.stateUrl, {
			running: true,
			paused: false,
		})
	}

	public async stop() {
		await this.patch(this.stateUrl, {
			running: false,
		})
	}

	public async reload(): Promise<void> {
		await this.axios.post(this.executionIdUrl + '/actions/reload')
	}

	public async reset() {
		await this.axios.delete(this.executionIdUrl)
		await this.createExecution()
	}

	public async update(parameters: Record<string, any>) {
		const { data } = await this.axios.get(this.executionIdUrl + '/graph/nodes')
		const nodes = data as NeuropypeNode[]

		for (const node of nodes) {
			if (node.type === 'ParameterPort') {
				const { data: portName } = await this.axios.get(
					this.generatePortnameValueUrl(node.id)
				)
				if (parameters?.[portName]) {
					await this.axios.put(
						this.generateUpdateParametersUrl(node.id),
						parameters[portName],
						{
							headers: {
								'Content-Type': 'application/json',
							},
						}
					)
				}
			}
		}
	}

	private generateUpdateParametersUrl(id: string): string {
		return (
			this.executionIdUrl + '/graph/nodes/' + id + '/parameters/default/value'
		)
	}

	private generatePortnameValueUrl(id: string): string {
		return (
			this.executionIdUrl + '/graph/nodes/' + id + '/parameters/portname/value'
		)
	}

	protected get executionIdUrl() {
		return `${this.baseUrl}/executions/${this.executionId}`
	}

	protected get stateUrl(): string {
		return this.executionIdUrl + '/state'
	}

	private async post(url: string, args?: Record<string, any>) {
		try {
			return await this.axios.post(url, args)
		} catch (err) {
			this.log.error('Failed to load pipeline', this.path)
			throw err
		}
	}

	private async patch(url: string, args?: Record<string, any>) {
		try {
			return await this.axios.patch(url, args)
		} catch (err) {
			this.log.error('Failed to patch pipeline', this.path)
			throw err
		}
	}

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
	reload(): Promise<void>
	update(parameters: Record<string, any>): Promise<void>
}

interface NeuropypeNode {
	id: string
	type: string
}
