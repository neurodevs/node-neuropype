import fs from 'fs'
import axios, { AxiosInstance } from 'axios'

export class Pipeline {

    protected filePath: string
    protected httpClient: AxiosInstance
    protected executionId?: number

    public constructor({ filePath, httpClient = axios }: PipelineArgs) {
        this.validateFilePath(filePath)

        this.filePath = filePath
        this.httpClient = httpClient
    }

    public async createExecution() {
        try {
            const response = await this.httpClient.post('http://localhost:6937/executions')
            this.executionId = response.data.id
            return response
        } catch {
            this.executionId = undefined
            throw new Error('Failed to create execution!')
        }
    }

    private validateFilePath(filePath: string) {
        if (!fs.existsSync(filePath)) {
            throw new Error(`The pipeline file path "${filePath}" does not exist!`)
        }
    }
}

interface PipelineArgs {
    filePath: string
    httpClient?: AxiosInstance
}