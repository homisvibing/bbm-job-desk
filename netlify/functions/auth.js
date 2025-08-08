const { GoogleSpreadsheet } = require('google-spreadsheet');

// Function to handle the login and data fetching
exports.handler = async (event, context) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { username, password } = JSON.parse(event.body);

        // Service account credentials from Netlify Environment Variables
        const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDS);
        const doc = new GoogleSpreadsheet('1O5YchDeIuUnAKB9JJ88p44MjKYP86TIFannNxS9YwPY');
        await doc.useServiceAccountAuth(creds);
        await doc.loadInfo();

        // 1. Authenticate User
        const usersSheet = doc.sheetsByTitle['Users Data'];
        await usersSheet.loadCells('A:C'); // Assuming username and password are in columns A and B

        const rows = await usersSheet.getRows();
        const user = rows.find(row => row.username === username && row.password === password);

        if (!user) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Invalid username or password' })
            };
        }

        // 2. Fetch Tasks for the authenticated user
        const tasksSheet = doc.sheetsByTitle['Task Tracker'];
        const tasksRows = await tasksSheet.getRows();
        const userTasks = tasksRows
            .filter(task => task['Assigned To'] === username)
            .map(task => ({
                "Assigned To": task['Assigned To'],
                "Task Name": task['Task Name'],
                "Client Name": task['Client Name'],
                "Status": task['Status'],
                "End Date": task['End Date'],
                "Priority": task['Priority'],
                "Task Detail": task['Task Detail'],
                "Campaign": task['Campaign'],
                "Content Type": task['Content Type'],
                "Brief": task['Brief'],
                "Start Date": task['Start Date'],
                "Note": task['Note'],
                "Assigned By": task['Assigned By'],
            }));

        // 3. Fetch Bulletin Board
        const bulletinSheet = doc.sheetsByTitle['Bulletin Board'];
        const bulletinRows = await bulletinSheet.getRows();
        const bulletinPosts = bulletinRows.map(post => ({
            "Nickname": post['Nickname'],
            "Post Date": post['Post Date'],
            "Post Content": post['Post Content'],
        }));

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
};