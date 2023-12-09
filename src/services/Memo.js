import fetch from 'node-fetch';
import urlModule from 'url';
import cheerio from 'cheerio';

async function getThumbURL(url) {
    if (url.trim() === '') {
        return '';
    }

    try {
        const parsedUrl = urlModule.parse(url);
        const defaultDomain = `${parsedUrl.protocol}//${parsedUrl.hostname}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch the URL. Status: ${response.status}`);
        }

        const htmlText = await response.text();
        const $ = cheerio.load(htmlText);

        const ogImageMeta = $('meta[property="og:image"]');
        if (ogImageMeta.length > 0) {
            const thumbnailURL = ogImageMeta.attr('content');
            if (thumbnailURL) {
                return thumbnailURL;
            }
        }

        const defaultResponse = await fetch(defaultDomain);
        if (defaultResponse.ok) {
            const defaultHtmlText = await defaultResponse.text();
            const $default = cheerio.load(defaultHtmlText);

            const defaultOgImageMeta = $default('meta[property="og:image"]');
            if (defaultOgImageMeta.length > 0) {
                const defaultThumbnailURL = defaultOgImageMeta.attr('content');
                if (defaultThumbnailURL) {
                    return defaultThumbnailURL;
                }
            }
        }

        throw new Error('No og:image tag found on the page.');
    } catch (error) {
        console.error('Error:', error.message);
        return '';
    }
}

export default {
    createMemo: async ({ body, res }) => {
        const db = global.connection;
        const { type, identifier, title, comment, noti_cycle, noti_preset, isPinned, url, noti_count } = body;

        // 필수 파라미터 검증
        if (
            !type ||
            !identifier ||
            !title ||
            comment === undefined ||
            !noti_cycle ||
            !noti_preset ||
            isPinned === undefined
        ) {
            return res.status(400).json({ msg: 'Required parameter missing' });
        }

        try {
            let user_id;
            const userCheckQuery =
                type === 'id' ? 'SELECT id FROM User WHERE id = ?' : 'SELECT id FROM User WHERE UUID = ?';
            const userCheckResult = await db.query(userCheckQuery, [identifier]);

            if (userCheckResult[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            user_id = userCheckResult[0][0].id;

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

            await db.query('INSERT INTO Memo SET ?', newMemo);

            res.status(201).json({ msg: 'Memo created successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ msg: 'Database error' });
        }
    },

    readUserAllMemo: async ({ query, res }) => {
        const db = global.connection;
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

        try {
            const memos = await db.query('SELECT * FROM Memo WHERE user_id = ? ORDER BY updated_at DESC', [user_id]);

            res.json(memos[0]);
        } catch (err) {
            console.error(err);
            res.status(500).send({ msg: 'Database error' });
        }
    },

    readMemo: async ({ params, res }) => {
        const db = global.connection;
        const memo_id = params.memo_id;
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

    updateMemo: async ({ query, body, params, res }) => {
        const db = global.connection;
        const memo_id = params.memo_id;
        const updateData = body;
        const { type, identifier } = query;

        if (!type || !identifier) {
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

    deleteMemo: async ({ query, params, res }) => {
        const db = global.connection;
        const memo_id = params.memo_id;
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

    getThumbnailURL: async ({ query, res }) => {
        const { baseURL = '' } = query;

        try {
            const refinedThumbURL = await getThumbURL(baseURL);

            res.status(200).send({ url: refinedThumbURL });
        } catch (err) {
            console.error(err);
            res.status(400).send({ msg: 'Invalid URL' });
        }
    },
};
