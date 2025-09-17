import axios from 'axios';
import logger from "./logging";
import {StateData} from "./types/dto";

const log = logger('Agent');

const BACKEND_URL = 'https://lol-pick-ban-ui.onrender.com/state';

export async function sendToBackend(data: StateData): Promise<void> {
    if(process.env.RENDER_SERVICE_NAME) {
        return;
    }
    
    log.info(`Sending data to backend: ${JSON.stringify(data)}`);
    try {

        await axios.post(BACKEND_URL, data);
    } catch (err) {
        console.log(err);
    }

}
