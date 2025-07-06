import { Dropbox } from 'dropbox';
import dotenv from "dotenv";

dotenv.config();

const DROPBOX_ACCESS_TOKEN = process.env.DROPBOX_ACCESS_TOKEN;

// Create Dropbox client with proper Node.js configuration
const dropbox = new Dropbox({
    accessToken: DROPBOX_ACCESS_TOKEN,
    // Use Node.js compatible settings
    fetch: require('isomorphic-fetch')
});

export default dropbox;