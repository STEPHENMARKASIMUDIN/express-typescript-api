export type ResponseJson = {
    ResponseCode: number,
    ResponseMessage: string,
    result?: any,
    body?: any,
}

export default function ResJSON(code: number, Msg: string): ResponseJson {
    return { ResponseCode: code, ResponseMessage: Msg }
}