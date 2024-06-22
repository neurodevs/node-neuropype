import { Pipeline, PipelineConstructorOptions } from '../nodeNeuropype.types'

export default class FakePipeline implements Pipeline {
    public constructorOptions?: PipelineConstructorOptions
    public loadHitCount = 0
    public startHitCount = 0
    public resetHitCount = 0
    public reloadHitCount = 0
    public updateHitCount = 0
    public stopHitCount = 0
    public deleteHitCount = 0
    public updateCalls: Record<string, any>[] = []

    public constructor(options?: PipelineConstructorOptions) {
        this.constructorOptions = options
    }
    

    public async load() {
        this.loadHitCount++
    }

    public async start() {
        this.startHitCount++
    }

    public async stop() {
        this.stopHitCount++
    }

    public async reset() {
        this.resetHitCount++
    }

    public async reload() {
        this.reloadHitCount++
    }

    public async update(parameters: Record<string, any>) {
        this.updateHitCount++
        this.updateCalls.push(parameters)
    }

    public clearFake() {
        this.loadHitCount = 0
        this.startHitCount = 0
        this.stopHitCount = 0
        this.resetHitCount = 0
        this.reloadHitCount = 0
        this.updateHitCount = 0
        this.updateCalls = []
    }

    public async delete(): Promise<void> {
        this.deleteHitCount++
    }
}
