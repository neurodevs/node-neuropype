import fs from 'fs'
import { assertOptions } from '@sprucelabs/schema'
import SpruceError from './errors/SpruceError'

export class Pipeline {
	public static Pipeline(options: PipelineOptions) {
		const { path } = assertOptions(options, ['path'])
		if (!fs.existsSync(path)) {
			throw new SpruceError({ path, code: 'PIPELINE_NOT_FOUND' })
		}
		return new this()
	}

	public async load() {}
}

interface PipelineOptions {
	path: string
}
