import AbstractSpruceTest, {
    test,
    assert,
    errorAssert,
    generateId,
} from '@sprucelabs/test-utils'
import Executions from '../../Executions'
import { ExecutionDetails } from '../../nodeNeuropype.types'
import AxiosStub from '../../testDoubles/AxiosStub'
import { generateFakedAxiosResponse } from '../../testDoubles/generateFakedAxiosResponse'

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

        assert.isEqual(
            this.axiosStub.lastGetUrl,
            `${process.env.NEUROPYPE_BASE_URL}/executions`
        )
    }

    @test('can delete one execution 1', '0000')
    @test('can delete one execution 2', '0001')
    protected static async callsDeleteForOnlyExecutionReturned(id: string) {
        this.axiosStub.fakedGetResponse = generateFakedAxiosResponse([
            {
                id,
            },
        ])

        await this.deleteAll()

        this.assertDeletAtIndexUsedId(0, id)
    }

    @test()
    protected static async callsDeleteOnMultipleExecutions() {
        this.axiosStub.fakedGetResponse = generateFakedAxiosResponse([
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
        this.axiosStub.fakedGetResponse = generateFakedAxiosResponse(
            JSON.stringify(data)
        )
        const actual = await Executions.getDetails('0000')

        assert.isEqual(
            this.axiosStub.lastGetUrl,
            `${process.env.NEUROPYPE_BASE_URL}/executions/0000`
        )
        assert.isEqualDeep(actual, data)
    }

    @test()
    protected static async canGetInfoOnASingleExecutionWithInvalidJson() {
        const details = this.validJsonWithInfinity()
        this.axiosStub.fakedGetResponse = generateFakedAxiosResponse(
            JSON.stringify(details).replaceAll('"Infinity"', 'Infinity')
        )
        const actual = await Executions.getDetails('0000')

        assert.isEqual(
            this.axiosStub.lastGetUrl,
            `${process.env.NEUROPYPE_BASE_URL}/executions/0000`
        )
        assert.isEqualDeep(actual, details)
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
        this.axiosStub.fakedGetResponse = generateFakedAxiosResponse(data)

        const actual = await Executions.getAll()

        assert.isEqualDeep(actual, data)
    }

    private static assertDeletAtIndexUsedId(idx: number, id: string) {
        assert.isEqualDeep(this.axiosStub.deleteParamsHistory[idx], {
            url: `${process.env.NEUROPYPE_BASE_URL}/executions/${id}`,
        })
    }

    private static async deleteAll() {
        await Executions.deleteAll()
    }

    private static validJsonWithInfinity(): ExecutionDetails {
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
