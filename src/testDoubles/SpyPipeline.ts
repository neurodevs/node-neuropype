import PipelineImpl from '../components/Pipeline'
import { PipelineConstructorOptions } from '../nodeNeuropype.types'

export default class SpyPipeline extends PipelineImpl {
    public constructor(options: PipelineConstructorOptions) {
        super(options)
    }

    public getExecutionUrl() {
        return this.executionIdUrl
    }
}
