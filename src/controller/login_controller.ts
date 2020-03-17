import { QueryOptions, Query } from 'mysql2';
import { Response, Request } from 'express';
import { LoginBody, MLSQL, timeout, responseEnd } from '../helper';
import ResJSON from '../helper/response_json';
import ResponseMessage from '../helper/response_message';
import loggerPortal from '../helper/logger';
import { ADMIN_LOGIN } from '../stored_procedures/stored_procedure';

async function login(req: Request, res: Response) {
    let retries: number = 0;
    await retry();
    async function retry() {
        let mlsql: MLSQL;
        let result: any;
        let options: QueryOptions;
        let body: LoginBody = req.body;
        try {
            if (!body.username || !body.password) {
                loggerPortal('error', ResponseMessage(16), '[login_controller.js]');
                responseEnd(ResJSON(463, ResponseMessage(16)), res);
            } else {
                mlsql = new MLSQL();
                await mlsql.establishConnection();
                options = {
                    sql: `CALL partnersintegration.${ADMIN_LOGIN}(?,?);`,
                    values: [body.username, body.password],
                    timeout
                }
                result = await mlsql.query(options);
                loggerPortal('info', result, `[login_controller.js]`);
                mlsql.releaseConnection();
                responseEnd({ ...ResJSON(200, ResponseMessage(200)), result: result[0] }, res);

            }
        } catch (error) {
            loggerPortal('error', error.message, `[login_controller.js]`);
            if (mlsql) {
                mlsql.releaseConnection();
            }
            if (retries >= 3) {
                responseEnd(ResJSON(500, ResponseMessage(0)), res);
            } else {
                retries++;
                await retry();
            }
        }

    }
}

export default login;