import AbstractSpruceTest, { test, assert, generateId } from '@sprucelabs/test-utils'
import { Pipeline } from '../../Pipeline'
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

export default class PipelineTest extends AbstractSpruceTest {
	private static filePath: string
	private static pipeline: SpyPipeline
	
	protected static async beforeEach() {
		jest.resetAllMocks()
		this.filePath = './pipelines/test_pipeline.pyp'
		this.pipeline = new SpyPipeline({ filePath: this.filePath, httpClient: mockedAxios })
	}

	@test()
	protected static async pipelineSetsFilePath() {
		assert.isEqual(this.filePath, this.pipeline.getFilePath())
	}

	@test()
	protected static async pipelineThrowsWithInvalidFilePath() {
		assert.doesThrow(() => new Pipeline({ filePath: generateId() }))
	}

	@test()
	protected static async pipelineSetsHttpClient() {
		assert.isEqual(this.pipeline.getHttpClient(), mockedAxios)
	}

	@test()
	protected static async pipelineCanCreateExecution() {
		await this.mockResolvedCreateExecution();
	}

	@test()
	protected static async pipelineThrowsWhenCreateExecutionFails() {
		await this.mockRejectedCreateExecution();
	}

	
	@test()
	protected static async pipelineExecutionIdResetsAfterFailureFollowingInitialSuccess() {
		await this.mockResolvedCreateExecution()
		await this.mockRejectedCreateExecution()
	}

	private static async mockResolvedCreateExecution() {
		const expectedData = { id: 123 };
		mockedAxios.post.mockResolvedValue({ data: expectedData });

		const response = await this.pipeline.createExecution();

		this.assertPostIsCalled();
		assert.isEqualDeep(response.data, expectedData);
		assert.isEqual(this.pipeline.getExecutionId(), response.data.id);
	}

	private static async mockRejectedCreateExecution() {
		mockedAxios.post.mockRejectedValue(new Error('Network error'));

		await assert.doesThrowAsync(
			async () => await this.pipeline.createExecution(),
			'Failed to create execution'
		);

		this.assertPostIsCalled()
		assert.isUndefined(this.pipeline.getExecutionId())
	}

	private static assertPostIsCalled() {
		expect(mockedAxios.post).toHaveBeenCalled();
		expect(mockedAxios.post).toHaveBeenCalledWith(
			'http://localhost:6937/executions'
		);
	}
}

class SpyPipeline extends Pipeline {
	public getFilePath() {
		return this.filePath
	}

	public getHttpClient() {
		return this.httpClient
	}

	public getExecutionId() {
		return this.executionId
	}
}


