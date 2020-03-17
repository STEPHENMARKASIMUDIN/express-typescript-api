import * as express from 'express';
import * as compression from 'compression';
import * as helmet from 'helmet';
import * as Bluebird from 'bluebird';
import * as cors from 'cors';
import ResponseMessage from './response_message';
import loggerPortal from './logger'
import { createLogger, transports } from 'winston';
import { join, basename } from 'path';
import { json, urlencoded } from 'body-parser';
import { createServer, Server } from 'http';
import { Request, Response, NextFunction } from 'express';
import { mkdir, createWriteStream, PathLike, ReadStream, createReadStream } from 'fs'
import {
    PoolConnection, QueryOptions, QueryError, Pool,
    createPool, RowDataPacket, OkPacket
} from 'mysql2';
import ResJSON, { ResponseJson } from './response_json';

export function responseEnd(responsePortal: ResponseJson, res: Response) {
    return res.json({ ...responsePortal }).end();
}

export function makeDate(date?: string): Date | string {
    try {
        let d = <Date | string>new Date(date);
        return d === 'Invalid Date' ? new Date() : d;
    } catch (error) {
        return new Date();
    }
}
export function month(d?: Date | string): string {
    if (typeof d === 'string') {
        d = <Date>makeDate(d);
        d = (d.getMonth() + 1).toString();
        return d.length == 1 ? `0${d}` : d;
    }
    let m = (d.getMonth() + 1).toString();
    return m.length == 1 ? `0${m}` : m;
}


export function year(d?: Date | string): string {
    if (typeof d === 'string') {
        d = <Date>makeDate(d);
        return d.getFullYear().toString();
    }
    return d.getFullYear().toString();
}


export function day(d?: Date | string): string {
    let day: string = '';
    if (typeof d === 'string') {
        d = <Date>makeDate(d);
        day = d.getDate().toString();
        return day.length == 1 ? `0${day}` : day;
    }
    day = d.getDate().toString();
    return day.length == 1 ? `0${day}` : day;
}
export function logsFileName(): string {
    let d = new Date();
    return `MLPortalService${year(d)}-${month(d)}-${day(d)}.log`
}

export const logPath = (): string => {
    const env = process.env.NODE_ENV;
    return env == "development" ? join(process.env.LogsDevPath, '/MLPortalServiceLogs', logsFileName()) :
        join(process.env.LogsProdPath, '/MLPortalServiceLogs', logsFileName())
}
export const logger = () => {
    return createLogger({
        transports: [
            new transports.File({
                filename: logPath(),
                level: 'info',
                maxFiles: 3,
                maxsize: 5242880,
            })
        ]
    });
}

export const timeout: number = 40000;

export interface LoginBody {
    username: string
    password: string
}

/**
* A Utility class that helps making database queries, transactions easier and faster.
*
* Note: Configuration must be in the ".env" file
*
* @example
* ".env"
* DBHost = "Your DB Host"
* DBPort = "Your DB Port" //defaults to 3306
* DBUser = "Your DB User"
* DBPass = "Your DB Pass"
*
* @class
* @constructor
*
*/



export class MLSQL {
    /**
     * Pool instance from database
     * @property pool
     * @type Pool
     */
    pool: Pool
    /**
     * A connection instance from the Pool
     * @public
     * @property connection
     * @type {PoolConnection}
     */
    connection: PoolConnection

    /** 
   * A boolean that indicates if the MLSQL instance is connected to the database or not.
   * @private
   * @property _isConnected
   * @type {boolean}
   */
    private _isConnected: boolean = false

    constructor() {
        this.pool = createPool({
            host: process.env.DBHost,
            port: +process.env.DBPort,
            user: process.env.DBUser,
            password: process.env.DBPass,
            connectionLimit: 5000,
        })
    }
    /**
     * Establishes a connection to the database.
     * 
     * Returns a rejected promise if something went wrong during connecting to the database.
     * 
     * @method
     * @member
     */
    establishConnection() {
        return new Bluebird.Promise((res, rej) => {
            this.pool.getConnection((e, con) => {
                return e ? rej(e) : (this._isConnected = true, this.connection = con, res(con));
            })
        })
    }

    /**
     * Makes a query call to the database
     * 
     * Note: Use the transaction method if your query consists of modifying or updating the database.
     * 
     * Returns a rejected promis if something went wrong during query execution.
     * 
     * @method
     * @param options
     */

    query(options: QueryOptions) {
        if (this._isConnected) {
            return new Bluebird.Promise((res, rej) => {
                this.connection.query(options, (e: QueryError, rows: RowDataPacket) => {
                    return e ? rej(e) : res(rows);
                })
            })
        }
    }

    /**
    * Makes a transaction call to the database.
    *
    * Note: Use this method if your query consists of modifying or updating the database else use the query method.
    *
    * Returns a rejected promise if something went wrong with the transaction.
    *
    *
    * @method
    * @param options
    */
    transaction(options: QueryOptions) {
        if (this._isConnected) {
            return new Bluebird.Promise((res, rej) => {
                this.connection.beginTransaction(e => {
                    if (e) { rej(e); }
                    else {
                        this.connection.query(options, (e: QueryError, rows: OkPacket) => {
                            if (e) {
                                this.rollback();
                                rej(e);
                            } else {
                                return rows.affectedRows ? (this.commit(), res(rows)) : (this.rollback(), res(rows));
                            }
                        })
                    }
                })
            })
        }
    }
    rollback() {
        if (this._isConnected) {
            this.connection.rollback(() => { console.log(`Rollbacked`) });
        }
    }
    commit() {
        if (this._isConnected) {
            this.connection.commit();
        }
    }
    releaseConnection() {
        if (this._isConnected) {
            this.connection.release();
        }
    }
}
export interface MLPortalServiceRoutes {
    path: string,
    router: express.Router
}
export class App {
    app: express.Application;

    constructor(private routes: MLPortalServiceRoutes[]) {
        this.createDir();
        this.app = express();
        this.app.set('env', process.env.NODE_ENV);
        this.initializeMiddleWares();
        this.initializeRoutes();
    }
    private initializeRoutes(): void {
        this.routes.forEach(route => {
            this.app.use(route.path, route.router);
        });
        this.initialize404s();

    }
    private initialize404s = (): void => {
        this.app.get("*", (req, res): express.Response => {
            loggerPortal('error', `${ResponseMessage(404)} ${req.path}`, `[App.get mlportalservice app.get()]`);
            return res.status(404).json(ResJSON(404, ResponseMessage(404)));
        });
        this.app.post("*", (req, res): express.Response => {
            loggerPortal('error', `${ResponseMessage(404)} ${req.path}`, `[App.post mlportalservice app.get()]`);
            return res.status(404).json(ResJSON(404, ResponseMessage(404)));
        });
    }

    private createDir() {
        mkdir(join(process.env.LogsProdPath, '/MLPortalServiceLogs'), e => {
            if (e) {
                if (e.code == 'EEXIST') {
                    console.log(`Directory for Logs already exists!`)
                    return;
                }
            }
            console.log('Directory Logs Created');
        });

    }
    private initializeMiddleWares(): void {
        this.app.use(helmet());
        this.app.use(compression());
        this.app.use(cors());
        this.app.use(json());
        this.app.use(urlencoded({ extended: false }));
    }
    public listen(): Server {
        return createServer(this.app).listen(process.env.PORT, () => {
            console.log(`Server listening at port: ${process.env.PORT}`);
        });
    }
}