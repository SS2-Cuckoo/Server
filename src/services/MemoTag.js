export default {
    addTagToMemo: async ({ body, res }) => {
        const db = global.connection;
        const { memo_id, tag_id } = body;

        // 필수 파라미터 검증
        if (!memo_id || !tag_id) {
            return res.status(400).json({ msg: 'Missing required parameters' });
        }

        try {
            const existingPair = await db.query('SELECT * FROM MemoTag WHERE memo_id = ? AND tag_id = ?', [
                memo_id,
                tag_id,
            ]);

            if (existingPair[0].length > 0) {
                return res.status(409).json({ msg: 'This tag is already assigned to the memo' });
            }

            await db.query('INSERT INTO MemoTag (memo_id, tag_id) VALUES (?, ?)', [memo_id, tag_id]);
            res.json({ msg: 'Tag added to memo successfully' });
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    readTagOfMemos: async ({ query, res }) => {
        const { tag_id, type, identifier } = query;
        const db = global.connection;

        if (!tag_id || !type || !identifier) {
            return res.status(400).json({ msg: 'Required parameters are missing' });
        }

        try {
            const userCheckQuery =
                type === 'id' ? 'SELECT id FROM User WHERE id = ?' : 'SELECT id FROM User WHERE UUID = ?';
            const userCheckResult = await db.query(userCheckQuery, [identifier]);

            if (userCheckResult[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const results = await db.query('SELECT * FROM MemoTag WHERE tag_id = ?', [tag_id]);

            res.json(results[0].map(row => row.memo_id));
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    readMemoOfTags: async ({ query, res }) => {
        const { memo_id, type, identifier } = query;
        const db = global.connection;

        if (!memo_id || !type || !identifier) {
            return res.status(400).json({ msg: 'Required parameters are missing' });
        }

        try {
            const userCheckQuery =
                type === 'id' ? 'SELECT id FROM User WHERE id = ?' : 'SELECT id FROM User WHERE UUID = ?';
            const userCheckResult = await db.query(userCheckQuery, [identifier]);

            if (userCheckResult[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const results = await db.query('SELECT * FROM MemoTag WHERE memo_id = ?', [memo_id]);

            res.json(results[0].map(row => row.tag_id));
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    deleteTagMemo: async ({ query, body, res }) => {
        const { memo_id, tag_id } = body;
        const { type, identifier } = query;
        const db = global.connection;

        if (!memo_id || !tag_id || !type || !identifier) {
            return res.status(400).json({ msg: 'Required parameters are missing' });
        }

        try {
            const userCheckQuery =
                type === 'id' ? 'SELECT id FROM User WHERE id = ?' : 'SELECT id FROM User WHERE UUID = ?';
            const userCheckResult = await db.query(userCheckQuery, [identifier]);

            if (userCheckResult[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            user_id = userCheckResult[0][0].id;
        } catch (err) {
            console.error(err);
            res.status(403).send({ msg: 'Unauthorized approach' });
        }

        try {
            // MemoTag 삭제
            await db.query('DELETE FROM MemoTag WHERE memo_id = ? AND tag_id = ?', [memo_id, tag_id]);

            res.json({ msg: 'Tag and its references deleted successfully' });
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },
};
