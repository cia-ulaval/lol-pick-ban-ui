import express from 'express';
import http from 'http';

import WebSocketServer from './websocket';
import logger, {setLogLevel} from './logging';
import TickManager from './TickManager';
import {AddressInfo} from 'net';
import State from './state';
import {getDataProvider} from './data/DataProviderService';
import minimist from 'minimist';
import DataDragon from './data/league/DataDragon';
import Controller from './state/Controller';
import GlobalContext from './GlobalContext';
import './Console';
import dotenv from "dotenv";

const argv = minimist(process.argv.slice(2));

// Needs to be done before logging is initialized, in order to set log level correctly
GlobalContext.commandLine = {
    data: argv['data'],
    record: argv['record'],
    leaguePath: argv['leaguePath'] || '',
    experimentalConnector: argv['experimentalConnector'],
    debug: argv['debug'],
};
if (GlobalContext.commandLine.debug) {
    setLogLevel('debug');
}

const log = logger('main');
const app = express();

log.info('  _          _       ____  ___   ____    _   _ ___ ');
log.info(' | |    ___ | |     |  _ \\( _ ) | __ )  | | | |_ _|');
log.info(' | |   / _ \\| |     | |_) / _ \\/\\  _ \\  | | | || | ');
log.info(' | |__| (_) | |___  |  __/ (_>  < |_) | | |_| || | ');
log.info(' |_____\\___/|_____| |_|   \\___/\\/____/   \\___/|___|');
log.info('                                                   ');

log.debug('Logging in debug mode!');
log.info('Configuration: ' + JSON.stringify(GlobalContext.commandLine));
dotenv.config();

const state = new State();
const ddragon = new DataDragon(state);
const dataProvider = getDataProvider();
const controller = new Controller({dataProvider, state, ddragon});
const tickManager = new TickManager({controller});

const main = async (): Promise<void> => {
    await ddragon.init();
    app.use(express.json());
    tickManager.startLoop();

    const server = http.createServer(app);
    app.use('/cache', express.static(__dirname + '/../cache'));
    const wsServer = new WebSocketServer(server, state);
    wsServer.startHeartbeat();

    server.listen(parseInt(process.env.PORT || '8999'), "0.0.0.0", () => {
        if (server.address() === null) {
            return log.error('Failed to start server.');
        }
        const serverAddress = server.address() as AddressInfo;
        return log.info(`Server started on ${JSON.stringify(serverAddress)}`);
    });

    app.get('/', (_req, res) => {
        res.send('Backend is running');
    });

    app.post('/state', (req, res) => {
        log.info(`Received state update: ${JSON.stringify(req.body)}`);
        controller.applyNewStateFromServer(req.body);
        res.status(200).send({ message: "State received" });
    });
}

main().then();
