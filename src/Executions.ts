import axios, { Axios } from 'axios'
import SpruceError from './errors/SpruceError'

export default class Executions {
	public static axios: Axios = axios
	public static async deleteAll() {
		if (!this.baseUrl) {
			throw new SpruceError({ code: 'MISSING_NEUROPYPE_BASE_URL_ENV' })
		}

		const { data } = await this.axios.get(`${this.baseUrl}/executions`)
		for (const execution of data ?? []) {
			await this.axios.delete(`${this.baseUrl}/executions/${execution.id}`)
		}
	}

	private static get baseUrl() {
		return process.env.NEUROPYPE_BASE_URL
	}
}
