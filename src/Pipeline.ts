import fs from 'fs'
import { assertOptions } from '@sprucelabs/schema'
import axios, { AxiosInstance } from 'axios'
import SpruceError from './errors/SpruceError'

export class Pipeline {
	private static axios: AxiosInstance = axios

	public static async Pipeline(options: PipelineOptions) {
		const { path } = assertOptions(options, ['path'])

		if (!process.env.NEUROPYPE_BASE_URL) {
			throw new SpruceError({ code: 'MISSING_NEUROPYPE_BASE_URL_ENV' })
		}

		if (!fs.existsSync(path)) {
			throw new SpruceError({ path, code: 'PIPELINE_NOT_FOUND' })
		}

		await this.axios.post()

		return new this()
	}
}

interface PipelineOptions {
	path: string
}
