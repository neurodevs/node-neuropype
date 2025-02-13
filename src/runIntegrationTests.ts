import Executions from './components/Executions'
import PipelineImpl from './components/Pipeline'

const defaultPipelinePath =
    'C:\\Users\\suppo\\Lumena\\NeuropypeFiles\\lumena-edge-pipelines\\pipelines\\quality_check.pyp'

async function testGetAllExecutions() {
    const executionIds = await Executions.getAll()

    if (executionIds.length !== 0) {
        throw new Error("Found executions, but didn't expect to")
    }
}

async function testCreatePipeline() {
    await createPipeline()
    const executionIds = await Executions.getAll()

    if (executionIds.length !== 1) {
        throw new Error("Should have found 1 execution, but didn't")
    }
}

async function testCreateThenDeleteThenGetAll() {
    for (let i = 0; i < 3; i++) {
        await createPipeline()
    }
    await Executions.deleteAll()
    const executions = await Executions.getAll()

    if (executions.length !== 0) {
        throw new Error('Not all executions were deleted, but should have been')
    }
}

async function testGetDetails() {
    const pipeline = await createPipeline()
    const details = await pipeline.getDetails()

    if (!details) {
        throw new Error('No details found!')
    }
}

async function createPipeline() {
    return await PipelineImpl.Create(defaultPipelinePath)
}

async function main() {
    process.env.NEUROPYPE_BASE_URL = 'http://192.168.8.11:6937/'

    const tests = [
        testCreateThenDeleteThenGetAll,
        testGetAllExecutions,
        testCreatePipeline,
        testGetDetails,
    ] as const
    for (const test of tests) {
        await Executions.deleteAll()
        await test()
    }
}

main().catch((err) => {
    console.error(err)
})
