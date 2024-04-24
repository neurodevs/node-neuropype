import { PipelineConstructorOptions } from '../nodeNeuropype.types'
import PipelineImpl from '../Pipeline'

export default class SpyPipeline extends PipelineImpl {
    public constructor(options: PipelineConstructorOptions) {
        super(options)
    }

    public getExecutionUrl() {
        return this.executionIdUrl
    }
}
