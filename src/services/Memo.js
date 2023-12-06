import fetch from 'node-fetch';

const getThumbURL = async url => {
    if (url.trim() === '') return '';

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch the URL. Status: ${response.status}`);
        }

        const htmlText = await response.text();
        const match = htmlText.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);

        if (match && match[1]) {
            return match[1];
        } else {
            return '';
        }
    } catch (error) {
        console.error('Error:', error.message);
        return '';
    }
};

export default {
    createMemo: async ({ body, res }) => {
        const db = global.connection;
        const { user_uuid, title, comment, noti_cycle, noti_preset, isPinned, url, noti_count } = body;

        // 필수 파라미터 검증
        if (!user_uuid || !title || comment === undefined || !noti_cycle || !noti_preset || isPinned === undefined) {
            return res.status(400).json({ msg: 'Required parameter missing' });
        }

        try {
            // user_uuid로 user_id 찾기
            const userResults = await db.query('SELECT id FROM User WHERE UUID = ?', [user_uuid]);
            if (userResults[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }
            const user_id = userResults[0][0].id;

            const thumbURL = await getThumbURL(url || '');

            const newMemo = {
                user_id,
                title,
                comment,
                url: url || '',
                thumbURL,
                noti_cycle,
                noti_preset,
                noti_count: noti_count || 1,
                is_pinned: isPinned,
                created_at: new Date(),
                updated_at: new Date(),
            };

            console.log(newMemo);

            await db.query('INSERT INTO Memo SET ?', newMemo);

            res.status(201).json({ msg: 'Memo created successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ msg: 'Database error' });
        }
    },

    readUserAllMemo: async ({ body, res }) => {
        const db = global.connection;
        const { type, identifier } = body;

        if (!type || !identifier) {
            return res.status(400).json({ msg: 'Required parameter missing' });
        }

        try {
            let user_id;
            if (type === 'uuid') {
                const userResults = await db.query('SELECT id FROM User WHERE UUID = ?', [identifier]);
                if (userResults[0].length === 0) {
                    return res.status(404).json({ msg: 'User not found' });
                }
                user_id = userResults[0][0].id;
            } else if (type === 'id') {
                user_id = identifier;
            } else {
                return res.status(400).json({ msg: 'Invalid type' });
            }

            const memos = await db.query('SELECT * FROM Memo WHERE user_id = ? ORDER BY updated_at DESC', [user_id]);

            res.json(memos[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send({ msg: 'Database error' });
        }
    },

    readMemo: async ({ params, res }) => {
        const db = global.connection;
        const memo_id = params.id;

        try {
            const results = await db.query('SELECT * FROM Memo WHERE id = ?', [memo_id]);
            if (results[0].length === 0) {
                return res.status(404).json({ msg: 'Memo not found' });
            }

            res.json(results[0][0]);
        } catch (err) {
            console.error(err);
            res.status(500).send({ msg: 'Database error' });
        }
    },

    updateMemo: async ({ body, params, res }) => {
        const db = global.connection;
        const memo_id = params.id;
        const updateData = body;

        try {
            const findMemo = await db.query('SELECT * FROM Memo WHERE id = ?', [memo_id]);
            if (findMemo.length === 0) {
                return res.status(404).json({ msg: 'Memo not found' });
            }

            updateData.updated_at = new Date();
            await db.query('UPDATE Memo SET ? WHERE id = ?', [updateData, memo_id]);

            res.json({ msg: 'Memo updated successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ msg: 'Database error' });
        }
    },

    deleteMemo: async ({ params, res }) => {
        const db = global.connection;
        const memo_id = params.id;

        try {
            await db.query('DELETE FROM MemoTag WHERE memo_id = ?', [memo_id]);
            await db.query('DELETE FROM MemoLog WHERE memo_id = ?', [memo_id]);
            await db.query('DELETE FROM Memo WHERE id = ?', [memo_id]);

            res.json({ msg: 'Memo deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ msg: 'Database error' });
        }
    },
};
