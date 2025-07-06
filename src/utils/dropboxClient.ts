import { Dropbox } from 'dropbox';
import dotenv from "dotenv";

dotenv.config();

const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

const dropbox = new Dropbox({
    accessToken: DROPBOX_ACCESS_TOKEN,
    fetch: fetch
});

export default dropbox;