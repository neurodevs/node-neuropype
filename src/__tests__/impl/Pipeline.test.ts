import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
    generateId,
} from '@sprucelabs/test-utils'
import PipelineImpl from '../../components/Pipeline'
import AxiosStub from '../../testDoubles/axios/AxiosStub'
import { generateFakedAxiosResponse } from '../../testDoubles/axios/generateFakedAxiosResponse'
import SpyPipeline from '../../testDoubles/Pipeline/SpyPipeline'

export default class PipelineTest extends AbstractSpruceTest {
    private static pipeline: SpyPipeline
    private static axiosStub: AxiosStub
    private static fakeResponse: any
    private static executionId: string
    private static emptyPipelinePath: string
    private static expectedLoadParams: any

    protected static async beforeEach() {
        await super.beforeEach()
        process.env.NEUROPYPE_BASE_URL = generateId()

        this.executionId = generateId()
        this.axiosStub = new AxiosStub()

        PipelineImpl.Class = SpyPipeline
        PipelineImpl.axios = this.axiosStub

        // @ts-ignore
        PipelineImpl.parse = (data: string) => {
            return data
        }

        delete this.axiosStub.responseToPost
        delete this.axiosStub.lastDeleteParams
        this.axiosStub.fakeGetResponsesByUrl = {}
        this.axiosStub.patchParamsHistory = []
        this.resetLastPostParams()

        this.emptyPipelinePath = this.resolvePath(
            `build/testDoubles/fakePipelines/empty_pipeline.pyp`
        )

        this.expectedLoadParams = {
            url: `${this.executionIdUrl}/actions/load`,
            config: undefined,
            data: {
                file: this.emptyPipelinePath,
                what: 'graph',
            },
        }

        this.fakeResponse = generateFakedAxiosResponse(generateId())
        this.axiosStub.fakeGetResponsesByUrl[this.executionIdUrl] =
            this.fakeResponse

        this.pipeline = (await PipelineImpl.Create(
            this.emptyPipelinePath
        )) as SpyPipeline
    }

    @test()
    protected static async throwsWithMissingParams() {
        //@ts-ignore
        const err = await assert.doesThrowAsync(() => PipelineImpl.Create())
        errorAssert.assertError(err, 'MISSING_PARAMETERS', {
            parameters: ['pypFilepath'],
        })
    }

    @test()
    protected static async throwsWhenPathDoesNotEndInPyp() {
        const invalidPath = generateId()
        const err = await assert.doesThrowAsync(() =>
            PipelineImpl.Create(invalidPath)
        )
        errorAssert.assertError(err, 'INVALID_PIPELINE_FORMAT', {
            path: invalidPath,
        })
    }

    @test.skip()
    protected static async throwsWithPipelineNotFound() {
        // Skipped because of Mac Mini to Windows path issues.
        // Should be re-implemented once we have a better way to test this.
        const missingPath = `${generateId()}.pyp`
        const err = await assert.doesThrowAsync(() =>
            PipelineImpl.Create(missingPath)
        )
        errorAssert.assertError(err, 'PIPELINE_NOT_FOUND', {
            path: missingPath,
        })
    }

    @test()
    protected static async throwsWithMissingEnv() {
        delete process.env.NEUROPYPE_BASE_URL
        const err = await assert.doesThrowAsync(() =>
            PipelineImpl.Create(generateId())
        )
        errorAssert.assertError(err, 'MISSING_NEUROPYPE_BASE_URL_ENV')
    }

    @test()
    protected static async creatingPipelineCreatesExecutionAndLoadsPipeline() {
        await PipelineImpl.Create(this.emptyPipelinePath)

        this.assertFirstPostParamsEqualsExpected()

        const loadParams = this.axiosStub.postParamsHistory[1]
        assert.isEqualDeep(loadParams, this.expectedLoadParams)
    }

    @test()
    protected static async canRunPipeline() {
        await this.pipeline.start()

        const runParams = this.axiosStub.patchParamsHistory[0]
        assert.isEqualDeep(runParams, {
            url: this.stateUrl,
            config: undefined,
            data: {
                running: true,
                paused: false,
            },
        })
    }

    @test()
    protected static async canStopPipeline() {
        await this.pipeline.stop()
        assert.isEqualDeep(this.axiosStub.patchParamsHistory[0], {
            url: this.stateUrl,
            config: undefined,
            data: {
                running: false,
            },
        })
    }

    @test()
    protected static async resetKillsExecution() {
        await this.pipeline.reset()
        assert.isEqualDeep(this.axiosStub.lastDeleteParams, {
            url: this.executionIdUrl,
        })
    }

    @test()
    protected static async resetStartsNewExecution() {
        this.executionId = generateId()
        this.resetLastPostParams()

        await this.pipeline.reset()

        this.assertFirstPostParamsEqualsExpected()
        assert.isEqual(this.pipeline.getExecutionUrl(), this.executionIdUrl)
    }

    @test()
    protected static async resetLoadsPipelineIntoNewExecution() {
        await this.pipeline.reset()

        const loadParams = this.axiosStub.postParamsHistory[3]
        assert.isEqualDeep(loadParams, this.expectedLoadParams)
    }

    @test()
    protected static async updateStartsByGettingAllNodes() {
        const id = generateId()
        const node = this.generateParameterPortNode(id)
        this.fakeGetResponse([node])

        await this.update()

        assert.isEqualDeep(
            this.axiosStub.getHistory[0],
            this.executionIdUrl + '/graph/nodes'
        )

        this.assertGetAtIndexCheckForPortNameValueOfNode(1, id)
    }

    @test()
    protected static async callsGetOnFirstNodeIfTypeIsParameterPort() {
        const id = generateId()
        this.axiosStub.fakedGetResponse = generateFakedAxiosResponse([
            {
                id,
                type: generateId(),
            },
        ])
        await this.update()

        assert.isLength(this.axiosStub.getHistory, 1)
    }

    @test()
    protected static async callsGetOnAllNodesThatAreParameterPort() {
        const nodes = [
            this.generateParameterPortNode(),
            this.generateParameterPortNode(),
        ]

        this.fakeGetResponse(nodes)

        await this.update()

        this.assertGetAtIndexCheckForPortNameValueOfNode(1, nodes[0].id)
        this.assertGetAtIndexCheckForPortNameValueOfNode(2, nodes[1].id)
    }

    @test()
    protected static async callsPutToUpdateTheParamThatMatchesPortnameValue() {
        const updateKey = generateId()
        const updateValue = generateId()

        const node = this.generateParameterPortNode()

        this.fakeGetResponse([node])
        this.fakeResponseForPortnameValue(node.id, updateKey)

        await this.update({ [updateKey]: updateValue })

        assert.isEqual(
            this.axiosStub.lastPutUrl,
            this.generateUpdateParametersUrl(node.id)
        )

        assert.isEqualDeep(this.axiosStub.lastPutParams, updateValue)
        assert.isEqualDeep(this.axiosStub.lastPutConfig, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    @test()
    protected static async onlyUpdatesIfPortnameValueMatchesKey() {
        const nodes = [
            this.generateParameterPortNode(),
            this.generateParameterPortNode(),
            this.generateParameterPortNode(),
        ]

        this.fakeGetResponse(nodes)

        const updateKey = generateId()

        this.fakeResponseForPortnameValue(nodes[0].id, generateId())
        this.fakeResponseForPortnameValue(nodes[1].id, generateId())
        this.fakeResponseForPortnameValue(nodes[2].id, generateId())

        const value = generateId()
        await this.update({ [updateKey]: value })
        assert.isFalsy(this.axiosStub.lastPutUrl)
    }

    @test()
    protected static async canReloadPipeline() {
        this.axiosStub.postParamsHistory = []
        await this.pipeline.reload()
        assert.isEqualDeep(this.axiosStub.postParamsHistory[0], {
            url: `${this.executionIdUrl}/actions/reload`,
            config: undefined,
            data: undefined,
        })
    }

    @test()
    protected static async canDeletePipelineThatDeletesExecution() {
        await this.pipeline.delete()
        assert.isEqual(
            this.axiosStub.lastDeleteParams?.url,
            this.executionIdUrl
        )
    }

    @test()
    protected static async getDetailsCallsExpectedEndpoint() {
        await this.pipeline.getDetails()

        assert.isEqual(this.axiosStub.lastGetUrl, this.executionIdUrl)
    }

    @test()
    protected static async getDetailsRequestsTextFormatFromAxios() {
        await this.pipeline.getDetails()

        assert.isEqual(this.axiosStub.lastGetConfig?.responseType, 'text')
    }

    @test()
    protected static async callsParseFunctionFromJson5() {
        let passedData = {}

        // @ts-ignore
        PipelineImpl.parse = (data: string) => {
            passedData = data
            return {}
        }

        await this.pipeline.getDetails()

        assert.isEqual(passedData, this.fakeResponse.data)
    }

    private static fakeResponseForPortnameValue(id: string, updateKey: string) {
        this.axiosStub.fakeGetResponsesByUrl[
            this.generatePortnameValueUrl(id)
        ] = generateFakedAxiosResponse(updateKey)
    }

    private static generateUpdateParametersUrl(id: string) {
        return (
            this.executionIdUrl + `/graph/nodes/${id}/parameters/default/value`
        )
    }

    private static assertGetAtIndexCheckForPortNameValueOfNode(
        idx: number,
        id: string
    ) {
        assert.isEqual(
            this.axiosStub.getHistory[idx],
            this.generatePortnameValueUrl(id)
        )
    }

    private static generatePortnameValueUrl(id: string): string {
        return (
            this.executionIdUrl + `/graph/nodes/${id}/parameters/portname/value`
        )
    }

    private static fakeGetResponse(nodes: any[]) {
        this.axiosStub.fakedGetResponse = generateFakedAxiosResponse(nodes)
    }

    private static generateParameterPortNode(id?: string) {
        return {
            id: id ?? generateId(),
            type: 'ParameterPort',
        }
    }

    private static async update(params?: Record<string, any>) {
        await this.pipeline.update(params ?? {})
    }

    private static resetLastPostParams() {
        this.axiosStub.postParamsHistory = []
        this.fakeCreateExecution()
    }

    private static fakeCreateExecution() {
        const data = {
            id: this.executionId,
        }
        this.axiosStub.responseToPost = generateFakedAxiosResponse(data)
    }

    private static assertFirstPostParamsEqualsExpected() {
        const createExecutionParams = this.axiosStub.postParamsHistory[0]

        assert.isEqualDeep(createExecutionParams, {
            url: `${process.env.NEUROPYPE_BASE_URL}/executions`,
            data: {},
            config: undefined,
        })
    }

    private static get executionIdUrl() {
        return `${process.env.NEUROPYPE_BASE_URL}/executions/${this.executionId}`
    }

    private static get stateUrl() {
        return `${this.executionIdUrl}/state`
    }
}
