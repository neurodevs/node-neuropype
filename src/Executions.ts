import axios, { Axios, AxiosResponse } from 'axios'
import SpruceError from './errors/SpruceError'
import { ExecutionDetails } from './nodeNeuropype.types'

export default class Executions {
    public static axios: Axios = axios

    public static async deleteAll() {
        this.validateBaseUrl()

        const data = await this.getAll()
        const promises: Promise<any>[] = []

        for (const execution of data ?? []) {
            promises.push(this.deleteExecution(execution.id))
        }

        await Promise.all(promises)
    }

    public static async getAll(): Promise<{ id: string }[]> {
        return (await this.axios.get(`${this.baseUrl}/executions`)).data
    }

    public static deleteExecution(id: string): Promise<any> {
        return this.axios.delete(`${this.baseUrl}/executions/${id}`)
    }

    public static async getDetails(id: string): Promise<ExecutionDetails> {
        // Currently, NP occasionally returns invalid JSON
        // Once they fix that, this can be simplified
        // They are sending JSON5, which is not always valid JSON
        const res = await this.axios.get(`${this.baseUrl}/executions/${id}`, {
            responseType: 'text',
        })
        return this.json5Parse(res)
    }

    private static json5Parse(res: AxiosResponse<any, any>): ExecutionDetails {
        return JSON.parse(res.data.replaceAll('Infinity', '"Infinity"'))
    }

    private static validateBaseUrl() {
        if (!this.baseUrl) {
            throw new SpruceError({ code: 'MISSING_NEUROPYPE_BASE_URL_ENV' })
        }
    }

    private static get baseUrl() {
        return process.env.NEUROPYPE_BASE_URL
    }
}
