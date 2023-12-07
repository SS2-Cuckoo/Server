export default {
    createTag: async ({ body, res }) => {
        let { name, color, user_id, uuid } = body;
        const db = global.connection;

        // 입력 값 검증
        if (!name || !color || color.length !== 6) {
            return res.status(400).json({ msg: 'Invalid input' });
        }

        // UUID가 제공된 경우, user_id를 조회
        if (uuid) {
            const userResult = await db.query('SELECT id FROM User WHERE UUID = ?', [uuid]);

            if (userResult[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }
            user_id = userResult[0][0].id;
        }

        try {
            // Tag 생성
            const tagResult = await db.query('INSERT INTO Tag (name, color, memoCount) VALUES (?, ?, 0)', [
                name,
                color,
            ]);
            const tag_id = tagResult[0].insertId;

            // MemoTag에 관계 생성
            await db.query('INSERT INTO MemoTag (memo_id, tag_id) VALUES (?, ?)', [user_id, tag_id]);

            res.status(201).json({ msg: 'Tag created', tagId: tag_id });
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    readUserAllTag: async ({ body, res }) => {
        const { type, id, uuid } = body;
        const db = global.connection;

        let userId;
        if (type === 'uuid') {
            const user = await db.query('SELECT id FROM User WHERE UUID = ?', [uuid]);
            if (user[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }
            userId = user[0][0].id;
        } else {
            userId = id;
        }

        try {
            const tags = await db.query(
                'SELECT * FROM Tag WHERE id IN (SELECT tag_id FROM MemoTag WHERE memo_id IN (SELECT id FROM Memo WHERE user_id = ?)) ORDER BY id',
                [userId]
            );
            res.json(tags[0]);
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    readTag: async ({ params, res }) => {
        const { id } = params;
        const db = global.connection;

        try {
            const tag = await db.query('SELECT * FROM Tag WHERE id = ?', [id]);
            if (tag[0].length === 0) {
                return res.status(404).json({ msg: 'Tag not found' });
            }
            res.json(tag[0][0]);
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    updateTag: async ({ params, body, res }) => {
        const { id } = params;
        const { name, color } = body;
        const db = global.connection;

        // 업데이트할 컬럼과 값 설정
        const updates = [];
        if (name !== undefined) {
            updates.push(`name = '${name}'`);
        }
        if (color !== undefined) {
            updates.push(`color = '${color}'`);
        }

        // 업데이트할 내용이 없는 경우
        if (updates.length === 0) {
            return res.status(400).json({ msg: 'No valid fields to update' });
        }

        const updateQuery = `UPDATE Tag SET ${updates.join(', ')} WHERE id = ?`;

        try {
            const updateResult = await db.query(updateQuery, [id]);
            if (updateResult[0].affectedRows === 0) {
                return res.status(404).json({ msg: 'Tag not found' });
            }
            res.json({ msg: 'Tag updated' });
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    deleteTag: async ({ params, res }) => {
        const { id } = params;
        const db = global.connection;

        try {
            // 먼저 Tag를 참조하는 MemoTag 테이블의 행을 삭제
            await db.query('DELETE FROM MemoTag WHERE tag_id = ?', [id]);

            // Tag 테이블에서 해당 태그 삭제
            const deleteResult = await db.query('DELETE FROM Tag WHERE id = ?', [id]);

            if (deleteResult[0].affectedRows === 0) {
                return res.status(404).json({ msg: 'Tag not found' });
            }

            res.json({ msg: 'Tag and related entries deleted' });
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },
};
