export interface Pipeline {
    load(): Promise<void>
    start(): Promise<void>
    stop(): Promise<void>
    reset(): Promise<void>
    reload(): Promise<void>
    delete(): Promise<void>
    update(parameters: Record<string, any>): Promise<void>
}

export type PipelineConstructor = new (
    options: PipelineConstructorOptions
) => Pipeline

export interface PipelineOptions {
    path: string
}

export interface PipelineConstructorOptions {
    baseUrl: string
    path: string
}

export interface PipelineNode {
    id: string
    type: string
}
