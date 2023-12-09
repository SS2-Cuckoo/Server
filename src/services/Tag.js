export default {
    createTag: async ({ body, res }) => {
        let { name, color, type, identifier } = body;
        const db = global.connection;

        // 입력 값 검증
        if (!name || !type || !identifier || !color || color.length !== 6) {
            return res.status(400).json({ msg: 'Invalid input' });
        }

        try {
            let user_id;
            const userCheckQuery =
                type === 'id' ? 'SELECT id FROM User WHERE id = ?' : 'SELECT id FROM User WHERE UUID = ?';
            const userCheckResult = await db.query(userCheckQuery, [identifier]);

            if (userCheckResult[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // Tag 이름 중복 체크
            const existingTag = await db.query('SELECT id FROM Tag WHERE name = ?', [name]);
            if (existingTag[0].length > 0) {
                const existingTagId = existingTag[0][0].id;
                // UserTag에서 해당 user_id와 연관된 Tag가 있는지 확인
                const userTagCheck = await db.query('SELECT * FROM UserTag WHERE user_id = ? AND tag_id = ?', [
                    user_id,
                    existingTagId,
                ]);
                if (userTagCheck[0].length > 0) {
                    return res.status(409).json({ msg: 'Tag already exists for this user' });
                }
            }

            // 새 Tag 생성
            const tagResult = await db.query('INSERT INTO Tag (name, color, memoCount) VALUES (?, ?, 0)', [
                name,
                color,
            ]);
            const tag_id = tagResult[0].insertId;

            // UserTag에 관계 생성
            await db.query('INSERT INTO UserTag (user_id, tag_id) VALUES (?, ?)', [user_id, tag_id]);

            res.status(201).json({ msg: 'Tag created', tagId: tag_id });
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    readUserAllTag: async ({ query, res }) => {
        const { type, identifier } = query;
        const db = global.connection;

        // 필수 파라미터 검증
        if (!type || !identifier) {
            return res.status(400).json({ msg: 'Missing required parameters' });
        }

        let userId;
        if (type === 'uuid') {
            const user = await db.query('SELECT id FROM User WHERE UUID = ?', [identifier]);
            if (user[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }
            userId = user[0][0].id;
        } else {
            userId = identifier;
        }

        try {
            // UserTag 테이블에서 해당 user_id에 해당하는 모든 Tag의 tag_id 찾기
            const userTags = await db.query('SELECT tag_id FROM UserTag WHERE user_id = ?', [userId]);

            // 찾은 tag_id들로 Tag 정보 조회
            const tagIds = userTags[0].map(userTag => userTag.tag_id);
            if (tagIds[0].length === 0) {
                return res.json([]); // 태그가 없는 경우 빈 배열 반환
            }

            const tags = await db.query(`SELECT * FROM Tag WHERE id IN (?) ORDER BY id ASC`, [tagIds]);

            res.json(tags[0]);
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    readTag: async ({ params, res }) => {
        const { id } = params;
        const db = global.connection;

        // 필수 파라미터 검증
        if (!id) {
            return res.status(400).json({ msg: 'Missing required parameters' });
        }

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

    updateTag: async ({ query, params, body, res }) => {
        const { id } = params;
        const { name, color } = body;
        const db = global.connection;

        // 필수 파라미터 검증
        if (!id) {
            return res.status(400).json({ msg: 'Missing required parameters' });
        }

        const { type, identifier } = query;

        if (!type || !identifier) {
            return res.status(400).json({ msg: 'Required parameters are missing' });
        }

        let user_id;
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

    deleteTag: async ({ query, params, res }) => {
        const { id } = params;
        const { type, identifier } = query;
        const db = global.connection;

        // 필수 파라미터 검증
        if (!id) {
            return res.status(400).json({ msg: 'Missing required parameters' });
        }

        if (!type || !identifier) {
            return res.status(400).json({ msg: 'Required parameters are missing' });
        }

        let user_id;
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
            // 먼저 Tag를 참조하는 MemoTag, UserTag 테이블의 행을 삭제
            await db.query('DELETE FROM MemoTag WHERE tag_id = ?', [id]);
            await db.query('DELETE FROM UserTag WHERE tag_id = ?', [id]);

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
