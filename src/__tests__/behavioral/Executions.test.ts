import AbstractSpruceTest, {
	test,
	assert,
	errorAssert,
	generateId,
} from '@sprucelabs/test-utils'
import Executions from '../../Executions'
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

	private static assertDeletAtIndexUsedId(idx: number, id: string) {
		assert.isEqualDeep(this.axiosStub.deleteParamsHistory[idx], {
			url: `${process.env.NEUROPYPE_BASE_URL}/executions/${id}`,
		})
	}

	private static async deleteAll() {
		await Executions.deleteAll()
	}
}
