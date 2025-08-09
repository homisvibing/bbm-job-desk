import { JWT } from 'google-auth-library';
import { GoogleSpreadsheet } from 'google-spreadsheet';

const SPREADSHEET_ID = '1O5YchDeIuUnAKB9JJ88p44MjKYP86TIFannNxS9YwPY';
const GOOGLE_SERVICE_ACCOUNT_CREDS = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDS);

export const handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { nickname, content } = JSON.parse(event.body);

        if (!nickname || !content) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Nickname and content are required' }),
            };
        }

        const doc = new GoogleSpreadsheet(SPREADSHEET_ID, new JWT({
            email: GOOGLE_SERVICE_ACCOUNT_CREDS.client_email,
            key: GOOGLE_SERVICE_ACCOUNT_CREDS.private_key,
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        }));
        await doc.loadInfo();
        const sheet = doc.sheetsByTitle['Bulletin Board'];

        const date = new Date().toISOString().split('T')[0];
        await sheet.addRow([nickname, date, content]);

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, message: 'Post added successfully' }),
        };
    } catch (error) {
        console.error('Post function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' }),
        };
    }
};