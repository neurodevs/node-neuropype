import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
    generateId,
} from '@sprucelabs/test-utils'
import Executions from '../components/Executions'
import { ExecutionDetails } from '../nodeNeuropype.types'
import AxiosStub from '../testDoubles/AxiosStub'
import { generateFakedAxiosResponse } from '../testDoubles/generateFakedAxiosResponse'

export default class ExecutionsTest extends AbstractSpruceTest {
    private static axiosStub: AxiosStub
    protected static async beforeEach() {
        await super.beforeEach()

        this.axiosStub = new AxiosStub()
        this.axiosStub.deleteParamsHistory = []
        Executions.axios = this.axiosStub

        process.env.NEUROPYPE_BASE_URL = generateId()
    }

    @test()
    protected static async throwsWithMissingEnv() {
        delete process.env.NEUROPYPE_BASE_URL
        const err = await assert.doesThrowAsync(() => this.deleteAll())
        errorAssert.assertError(err, 'MISSING_NEUROPYPE_BASE_URL_ENV')
    }

    @test()
    protected static async listsAllExecutionsFirst() {
        await this.deleteAll()
        this.assertLastAxiosGetUrlEquals('/executions')
    }

    @test('can delete one execution 1', '0000')
    @test('can delete one execution 2', '0001')
    protected static async callsDeleteForOnlyExecutionReturned(id: string) {
        this.dropInAxiosFakedGetResponse([
            {
                id,
            },
        ])

        await this.deleteAll()

        this.assertDeletAtIndexUsedId(0, id)
    }

    @test()
    protected static async callsDeleteOnMultipleExecutions() {
        this.dropInAxiosFakedGetResponse([
            {
                id: '0000',
            },
            {
                id: '0001',
            },
        ])

        await this.deleteAll()

        this.assertDeletAtIndexUsedId(0, '0000')
        this.assertDeletAtIndexUsedId(1, '0001')
    }

    @test()
    protected static async canGetInfoOnASingleExecution() {
        const data = {
            state: { running: false },
        }
        this.dropInAxiosFakedGetResponse(JSON.stringify(data))
        const actual = await Executions.getDetails('1234')

        this.assertLastAxiosGetUrlEquals('/executions/1234')
        assert.isEqualDeep(actual, data)
    }

    @test()
    protected static async canGetInfoOnASingleExecutionWithInvalidJson() {
        const details = this.generateExecutionDetailsValuesWithInfinity()
        this.dropInAxiosFakedGetResponse(JSON.stringify(details))
        const actual = await Executions.getDetails('0000')
        this.assertLastAxiosGetUrlEquals(`/executions/0000`)
        assert.isEqualDeep(actual, details)
    }

    @test('can get description from execution 1', '0000')
    @test('can get description from execution 2', '0001')
    protected static async canGetDescriptionsFromExecutions(id: string) {
        this.dropInAxiosFakedGetResponse({})
        await Executions.getDescription(id)
        this.assertLastAxiosGetUrlEquals(`/executions/${id}/graph/description`)
    }

    @test()
    protected static async getDescriptionReturnsResponse() {
        const data = {
            description: generateId(),
        }
        this.dropInAxiosFakedGetResponse(data)
        const actual = await Executions.getDescription('0000')
        assert.isEqualDeep(actual, data)
    }

    @test()
    protected static async exposesStaticGetAllMethod() {
        const data = [
            {
                id: '0000',
            },
            {
                id: '0001',
            },
        ]

        this.dropInAxiosFakedGetResponse(data)

        const actual = await Executions.getAll()

        assert.isEqualDeep(actual, data)
    }

    private static assertDeletAtIndexUsedId(idx: number, id: string) {
        assert.isEqualDeep(this.axiosStub.deleteParamsHistory[idx], {
            url: `${process.env.NEUROPYPE_BASE_URL}/executions/${id}`,
        })
    }

    private static assertLastAxiosGetUrlEquals(path: string) {
        assert.isEqual(
            this.axiosStub.lastGetUrl,
            `${process.env.NEUROPYPE_BASE_URL}${path}`
        )
    }

    private static async deleteAll() {
        await Executions.deleteAll()
    }

    private static dropInAxiosFakedGetResponse(data: any) {
        this.axiosStub.fakedGetResponse = generateFakedAxiosResponse(data)
    }

    private static generateExecutionDetailsValuesWithInfinity(): ExecutionDetails {
        return {
            state: {
                running: false,
                calibrating: false,
                had_errors: false,
                paused: false,
                needs_keepalive: false,
                completed: false,
                status: '',
            },
            graph: {
                nodes: [
                    {
                        uuid: 'd5ee6868-f6cb-41bc-ade1-440d5ab2f8e9',
                        type: 'DejitterTimestamps',
                        id: 0,
                        parameters: [
                            {
                                id: 'set_breakpoint',
                                value_domain: [0, 'Infinity'],
                                value: false,
                                port_type: 'BoolPort',
                                value_type: 'builtins.bool',
                            },
                        ],
                    },
                ],
                description: {
                    url: '',
                    name: '',
                    description: '',
                    status: '',
                    license: '',
                    version: '',
                },
                edges: [],
            },
            info: {
                debug_hooks: [],
                tickrate: 0,
                log_level: 0,
                error_mode: '',
            },
            id: 0,
            errors: [],
        }
    }
}
