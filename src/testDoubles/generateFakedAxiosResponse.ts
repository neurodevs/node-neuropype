export function generateFakedAxiosResponse(data: any) {
    return {
        data,
        config: {} as any,
        status: 200,
        statusText: 'OK',
        headers: {},
    }
}
