import Executions from './Executions'

async function testAbleToRun() {}

async function testGetAllExecutions() {
    const executionIds = await Executions.getAll()

    if (executionIds.length === 0) {
        throw new Error('No executions found')
    }
}

async function main() {
    process.env.NEUROPYPE_BASE_URL = 'http://localhost:6937/'

    await testAbleToRun()
    await testGetAllExecutions()
}

main().catch((err) => {
    console.error(err)
})
