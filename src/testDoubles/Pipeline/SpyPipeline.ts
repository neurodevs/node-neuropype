import PipelineImpl from '../../impl/Pipeline.js'
import { PipelineConstructorOptions } from '../../types.js'

export default class SpyPipeline extends PipelineImpl {
    public constructor(options: PipelineConstructorOptions) {
        super(options)
    }

    public getExecutionUrl() {
        return this.executionIdUrl
    }
}
