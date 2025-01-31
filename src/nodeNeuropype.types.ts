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

export interface ExecutionDetails {
    state: State
    info: Info
    id: number
    graph: Graph
    errors: any[]
}

export interface Graph {
    description: Description
    nodes: Node[]
    edges: Edge[]
}

export interface Description {
    url: string
    name: string
    description: string
    status: string
    license: string
    version: string
}

export interface Edge {
    source_node: number
    source_port: string
    target_port: string
    id: number
    target_node: number
}

export interface Node {
    id: number
    parameters: Parameter[]
    type: string
    uuid: string
}

export interface Parameter {
    value: number[] | boolean | ValueClass | number | null | string
    value_type: ValueType
    port_type: PortType
    value_domain: (number | 'Infinity' | '-Infinity')[] | null
    id: string
}

export type PortType =
    | 'BoolPort'
    | 'DictPort'
    | 'EnumPort'
    | 'FloatPort'
    | 'IntPort'
    | 'ListPort'
    | 'Port'
    | 'StringPort'

export interface ValueClass {}

export type ValueType =
    | 'builtins.bool'
    | 'builtins.dict'
    | 'builtins.float'
    | 'builtins.int'
    | 'builtins.list'
    | 'builtins.object'
    | 'builtins.str'

export interface Info {
    debug_hooks: any[]
    tickrate: number
    log_level: number
    error_mode: string
}

export interface State {
    calibrating: boolean
    had_errors: boolean
    paused: boolean
    needs_keepalive: boolean
    completed: boolean
    status: string
    running: boolean
}
