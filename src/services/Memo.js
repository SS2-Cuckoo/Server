export default {
    getAllUserMemo: async ({ res, params }) => {
        const db = global.connection;

        try {
            const userID = params.userID;
            const results = await db.query('SELECT * FROM Memo WHERE user_id = ?', [userID]);

            const jsonResults = results.map(row => {
                const jsonRow = {};
                for (const key in row) {
                    if (Buffer.isBuffer(row[key])) {
                        // Convert buffer to a string or parse as needed
                        jsonRow[key] = row[key].toString('utf8'); // Example: assuming utf8 encoding
                    } else {
                        jsonRow[key] = row[key];
                    }
                }
                return jsonRow;
            });

            res.json(jsonResults);
        } catch (err) {
            console.log(err);
            res.status(500).send('Database error');
        }
    },
};
