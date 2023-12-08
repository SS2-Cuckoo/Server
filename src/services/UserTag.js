export default {
    addTagToUser: async ({ body, res }) => {
        const db = global.connection;
        const { user_id, tag_id } = body;

        // 필수 파라미터 검증
        if (!user_id || !tag_id) {
            return res.status(400).json({ msg: 'Missing required parameters' });
        }

        try {
            const existingPair = await db.query('SELECT * FROM UserTag WHERE user_id = ? AND tag_id = ?', [
                user_id,
                tag_id,
            ]);

            if (existingPair[0].length > 0) {
                return res.status(409).json({ msg: 'This tag is already assigned to the user' });
            }

            await db.query('INSERT INTO UserTag (user_id, tag_id) VALUES (?, ?)', [user_id, tag_id]);

            res.json({ msg: 'Tag added to User successfully' });
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    readTagsOfUser: async ({ query, res }) => {
        const { user_id, type, identifier } = query;
        const db = global.connection;

        if (!user_id || !type || !identifier) {
            return res.status(400).json({ msg: 'Required parameters are missing' });
        }

        try {
            const userCheckQuery =
                type === 'id' ? 'SELECT id FROM User WHERE id = ?' : 'SELECT id FROM User WHERE UUID = ?';
            const userCheckResult = await db.query(userCheckQuery, [identifier]);

            if (userCheckResult[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const results = await db.query('SELECT * FROM UserTag WHERE user_id = ?', [user_id]);

            res.json(results[0].map(row => row.tag_id));
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    deleteTagOfUser: async ({ body, res }) => {
        const { user_id, tag_id } = body;
        const db = global.connection;

        if (!user_id || !tag_id) {
            return res.status(400).json({ msg: 'Required parameters are missing' });
        }

        try {
            // UserTag 삭제
            await db.query('DELETE FROM UserTag WHERE user_id = ? AND tag_id = ?', [user_id, tag_id]);

            res.json({ msg: 'Tag and its references deleted successfully' });
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },
};
