import { v4 as uuidv4 } from 'uuid';

export default {
    createUser: async ({ body, res }) => {
        const db = global.connection;
        const { username } = body;

        if (!username) {
            return res.status(400).send('Username is required');
        }

        const userUUID = uuidv4();

        try {
            await db.query('INSERT INTO User (username, UUID, created_at) VALUES (?, ?, ?)', [
                username,
                userUUID,
                new Date(),
            ]);
            res.json({ uuid: userUUID });
        } catch (err) {
            console.error(err);
            res.status(500).send('Database error');
        }
    },

    readUserByID: async ({ params, res }) => {
        const db = global.connection;
        const userID = params.id;

        // 필수 파라미터 검증
        if (!userID) {
            return res.status(400).json({ msg: 'Missing required parameters' });
        }

        try {
            const results = await db.query('SELECT * FROM User WHERE id = ?', [userID]);
            if (results[0].length === 0) {
                res.status(404).send('User not found');
            } else {
                res.json(results[0][0]);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Database error');
        }
    },

    readUserByUUID: async ({ params, res }) => {
        const db = global.connection;
        const userUUID = params.uuid;

        // 필수 파라미터 검증
        if (!userUUID) {
            return res.status(400).json({ msg: 'Missing required parameters' });
        }

        try {
            const results = await db.query('SELECT * FROM User WHERE UUID = ?', [userUUID]);
            if (results[0].length === 0) {
                res.status(404).send('User not found');
            } else {
                res.json(results[0][0]);
            }
        } catch (err) {
            console.error(err);
            res.status(500).send('Database error');
        }
    },

    deleteUser: async ({ params, res }) => {
        const db = global.connection;
        const { type, identifier } = params;

        // 필수 파라미터 검증
        if (!type || !identifier) {
            return res.status(400).json({ msg: 'Missing required parameters' });
        }

        let query = '';
        if (type === 'id') {
            query = 'DELETE FROM User WHERE id = ?';
        } else if (type === 'uuid') {
            query = 'DELETE FROM User WHERE UUID = ?';
        } else {
            return res.status(400).send('Invalid type');
        }
        try {
            await db.query(query, [identifier]);
            res.json({ msg: 'Successfully User Deleted' });
        } catch (err) {
            console.error(err);
            res.status(500).send('Database error');
        }
    },
};
