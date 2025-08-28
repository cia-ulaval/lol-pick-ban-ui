import https from 'https';
import axios from 'axios';
import needle, { NeedleResponse } from 'needle';
import {ConnectionInfo} from "./data/league/connector";
import logger from "./logging";

const log = logger('Agent');

const BACKEND_URL = 'https://lol-pick-ban-ui.onrender.com/state';

export async function sendToBackend(data: any): Promise<void> {
    log.info(`Sending data to backend: ${JSON.stringify(data)}`);
    try {
        await axios.post(BACKEND_URL, data);
    } catch (err) {
        console.log(err);
    }
}
