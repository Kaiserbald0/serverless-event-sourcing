// todo type  response
export async function main (): Promise<{
  statusCode: number
  body: any
}> {
  return {
    statusCode: 200,
    body: JSON.stringify({
      data: [{
        id: 'uuid',
        role: 'B'
      }, {
        id: 'uuid',
        role: 'C'
      }]
    })
  }
}
