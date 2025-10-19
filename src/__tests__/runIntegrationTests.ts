import { generateId } from '@sprucelabs/test-utils'
import Executions from '../components/Executions'
import PipelineImpl from '../components/Pipeline'

async function beforeEach() {
    await Executions.deleteAll()
}

async function testGetAllExecutions() {
    const numExecutions = await getNumExecutions()

    if (numExecutions !== 0) {
        throw new Error(`Should have found 0 executions, not ${numExecutions}!`)
    }
}

async function testCreatePipeline() {
    await createPipeline()

    const numExecutions = await getNumExecutions()

    if (numExecutions !== 1) {
        throw new Error(`Should have found 1 execution, not ${numExecutions}!`)
    }
}

async function testCreateThenDeleteThenGetAll() {
    for (let i = 0; i < 3; i++) {
        await createPipeline()
    }
    await Executions.deleteAll()

    const numExecutions = await getNumExecutions()

    if (numExecutions !== 0) {
        throw new Error(`Should have found 0 executions, not ${numExecutions}!`)
    }
}

async function testGetDetails() {
    const pipeline = await createPipeline()
    const details = await pipeline.getDetails()

    const actual = details.graph.description.name

    if (actual !== expectedName) {
        throw new Error(`Name should be ${expectedName}, not ${actual}!`)
    }
}

async function testStartAndStopPipeline() {
    const pipeline = await createPipeline()
    let details = await pipeline.getDetails()

    if (details.state.running) {
        throw new Error('Pipeline should not be running at start!')
    }

    await pipeline.start()
    details = await pipeline.getDetails()

    if (!details.state.running) {
        throw new Error('Pipeline should be running after start!')
    }

    await pipeline.stop()
    details = await pipeline.getDetails()

    if (details.state.running) {
        throw new Error('Pipeline should not be running after stop!')
    }
}

async function testUpdateParameters() {
    const hostname = generateId()
    const pipeline = await createPipeline()
    await pipeline.update({ hostname })

    const details = await pipeline.getDetails()

    const matchingNodes = details.graph.nodes.filter((node) =>
        node.parameters.some((param) => param.value === hostname)
    )

    const numMatchingNodes = matchingNodes.length

    if (numMatchingNodes !== 1) {
        throw new Error(`Should have found 1 node, not ${numMatchingNodes}!`)
    }
}

async function getNumExecutions() {
    const executionIds = await Executions.getAll()
    return executionIds.length
}

async function createPipeline() {
    return await PipelineImpl.Create(pypFilepath)
}

async function main() {
    process.env.NEUROPYPE_BASE_URL = 'http://192.168.8.11:6937/'

    const tests = [
        testCreateThenDeleteThenGetAll,
        testGetAllExecutions,
        testCreatePipeline,
        testGetDetails,
        testStartAndStopPipeline,
        testUpdateParameters,
    ] as const

    for (const test of tests) {
        console.log(`Running test: ${test}...`)
        await beforeEach()
        await test()
    }
}

const pypFilepath =
    'C:\\Users\\suppo\\Lumena\\NeuropypeFiles\\lumena-edge-pipelines\\pipelines\\quality_check.pyp'

const expectedName = 'Quality Check Muse S (2nd generation) 1.0'

main().catch((err) => {
    console.error(err)
})
