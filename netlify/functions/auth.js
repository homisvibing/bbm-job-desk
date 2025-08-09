import fetch from 'node-fetch';

const SPREADSHEET_ID = '1O5YchDeIuUnAKB9JJ88p44MjKYP86TIFannNxS9YwPY'; 
const API_KEY = process.env.GOOGLE_API_KEY;

const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/`;

async function fetchSheet(range) {
    const url = `${BASE_URL}${range}?key=${API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Error fetching data from sheet: ${response.statusText}`);
    }
    const data = await response.json();
    return data.values;
}

export async function handler(event) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { username, password } = JSON.parse(event.body);

        // 1. Fetch Users Data from the sheet
        const usersData = await fetchSheet('Users Data!A2:D');
        const user = usersData.find(row => row[0] === username && row[1] === password);

        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid username or password' })
            };
        }
        
        // Use the email field to link tasks
        const userEmail = user[3];

        // 2. Fetch Tasks for the authenticated user
        const tasksData = await fetchSheet('Task Tracker!A2:N');
        const tasksHeaders = ['Assigned To', 'Task Name', 'Client Name', 'Status', 'End Date', 'Priority', 'Task Detail', 'Campaign', 'Content Type', 'Brief', 'Start Date', 'Note', 'Assigned By'];
        const userTasks = tasksData
            .filter(row => row[0] === userEmail)
            .map(row => {
                const task = {};
                tasksHeaders.forEach((header, index) => {
                    task[header] = row[index];
                });
                return task;
            });
            
        // 3. Fetch Bulletin Board posts
        const bulletinData = await fetchSheet('Bulletin Board!A2:C');
        const bulletinHeaders = ['Nickname', 'Post Date', 'Post Content'];
        const bulletinPosts = (bulletinData || []).map(row => {
            const post = {};
            bulletinHeaders.forEach((header, index) => {
                post[header] = row[index];
            });
            return post;
        });

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Login successful',
                tasks: userTasks,
                bulletin: bulletinPosts
            })
        };
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal server error' })
        };
    }
}