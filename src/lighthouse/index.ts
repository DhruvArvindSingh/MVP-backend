import lighthouse from '@lighthouse-web3/sdk'
import dotenv from 'dotenv'
dotenv.config();

const apiKey = process.env.LIGHTHOUSE_API_KEY;

if (!apiKey) {
    throw new Error('LIGHTHOUSE_API_KEY is not set');
}

export { apiKey };
export default lighthouse;