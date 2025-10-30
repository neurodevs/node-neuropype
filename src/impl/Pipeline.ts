import axios, { Axios } from 'axios'
import json5 from 'json5'

import {
    ExecutionDetails,
    Pipeline,
    PipelineConstructor,
    PipelineConstructorOptions,
    PipelineNode,
} from '../types.js'

export default class PipelineImpl implements Pipeline {
    public static Class?: PipelineConstructor
    public static axios: Axios = axios
    public static parse = json5.parse

    private baseUrl: string
    private path: string
    private executionId?: string
    private log = console

    public static async Create(pypFilepath: string) {
        const neuropypeBaseUrl = process.env.NEUROPYPE_BASE_URL ?? ''

        this.validateBaseUrl(neuropypeBaseUrl)
        this.validateFileExtension(pypFilepath)

        const pipeline = new (this.Class ?? this)({
            neuropypeBaseUrl,
            pypFilepath,
        })
        await pipeline.load()

        return pipeline
    }

    private static validateBaseUrl(baseUrl: string) {
        if (!baseUrl) {
            throw new Error(
                'Please define NEUROPYPE_BASE_URL in your env! Usually: http://localhost:6937'
            )
        }
    }

    private static validateFileExtension(path: string) {
        if (!path.endsWith('.pyp')) {
            throw new Error(
                `Pipeline path must end in .pyp!\n\nFound: ${path}\n`
            )
        }
    }

    protected constructor(options: PipelineConstructorOptions) {
        const { neuropypeBaseUrl: baseUrl, pypFilepath: path } = options
        this.baseUrl = baseUrl
        this.path = path
    }

    public async load() {
        this.log.info(`Loading pipeline: ${this.path}`)
        await this.createExecution()
        await this.loadPipeline()
    }

    private async createExecution() {
        const { data } = await this.post(this.executionsUrl, {})
        const { id } = data
        this.executionId = id
    }

    private async loadPipeline() {
        await this.post(this.loadUrl, {
            file: this.path,
            what: 'graph',
        })
    }

    public async start() {
        this.log.info(`Starting pipeline: ${this.path}`)
        await this.patch(this.stateUrl, {
            running: true,
            paused: false,
        })
    }

    public async stop() {
        this.log.info(`Stopping pipeline: ${this.path}`)
        await this.patch(this.stateUrl, {
            running: false,
        })
    }

    public async delete() {
        this.log.info(`Deleting pipeline: ${this.path}`)
        await this.axios.delete(this.executionIdUrl)
    }

    public async reload() {
        this.log.info(`Reloading pipeline: ${this.path}`)
        await this.axios.post(this.reloadUrl)
    }

    public async reset() {
        this.log.info(`Resetting pipeline: ${this.path}`)
        await this.deleteExecution()
        await this.load()
    }

    private async deleteExecution() {
        await this.axios.delete(this.executionIdUrl)
    }

    public async update(parameters: Record<string, any>) {
        const { data } = await this.axios.get(this.nodesUrl)
        const nodes = data as PipelineNode[]

        this.log.info(
            `Updating pipeline: ${this.path}, parameters: ${JSON.stringify(parameters)}`
        )

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

    public async getDetails() {
        const response = await this.axios
            .get(this.executionIdUrl, { responseType: 'text' })
            .then(({ data }) => data)

        return PipelineImpl.parse(response) as ExecutionDetails
    }

    private get executionsUrl() {
        // Example: http://localhost:6937/executions
        return `${this.baseUrl}/executions`
    }

    protected get executionIdUrl() {
        // Example: http://localhost:6937/executions/1234
        return `${this.executionsUrl}/${this.executionId}`
    }

    private get loadUrl() {
        // Example: http://localhost:6937/executions/1234/actions/load
        return `${this.executionIdUrl}/actions/load`
    }

    private get reloadUrl() {
        // Example: http://localhost:6937/executions/1234/actions/reload
        return `${this.executionIdUrl}/actions/reload`
    }

    private get stateUrl() {
        // Example: http://localhost:6937/executions/1234/state
        return `${this.executionIdUrl}/state`
    }

    private get nodesUrl() {
        // Example: http://localhost:6937/executions/1234/graph/nodes
        return `${this.executionIdUrl}/graph/nodes`
    }

    private generateNodeUrl(nodeId: string) {
        // Example: http://localhost:6937/executions/1234/graph/nodes/5678
        return `${this.nodesUrl}/${nodeId}`
    }

    private generateUpdateParametersUrl(nodeId: string) {
        // Example: http://localhost:6937/executions/1234/graph/nodes/5678/parameters/default/value
        const nodeUrl = this.generateNodeUrl(nodeId)
        return `${nodeUrl}/parameters/default/value`
    }

    private generatePortnameValueUrl(nodeId: string) {
        // Example: http://localhost:6937/executions/1234/graph/nodes/5678/parameters/portname/value
        const nodeUrl = this.generateNodeUrl(nodeId)
        return `${nodeUrl}/parameters/portname/value`
    }

    private async post(url: string, args?: Record<string, any>) {
        try {
            return await this.axios.post(url, args)
        } catch (err) {
            this.log.error(
                `Failed POST to pipeline: ${this.path}, url: ${url}, args: ${JSON.stringify(args)}!`
            )
            throw err
        }
    }

    private async patch(url: string, args?: Record<string, any>) {
        try {
            return await this.axios.patch(url, args)
        } catch (err) {
            this.log.error(
                `Failed PATCH to pipeline: ${this.path}, url: ${url}, args: ${JSON.stringify(args)}!`
            )
            throw err
        }
    }

    private get axios() {
        return PipelineImpl.axios
    }
}
