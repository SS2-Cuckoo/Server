export default {
    createNotiLog: async ({ body, res }) => {
        const { type, identifier, related_preset } = body;
        const db = global.connection;

        if (!related_preset || !type || !identifier) {
            return res.status(400).json({ msg: 'Required parameters are missing' });
        }

        try {
            const userCheckQuery =
                type === 'id' ? 'SELECT id FROM User WHERE id = ?' : 'SELECT id FROM User WHERE UUID = ?';
            const userCheckResult = await db.query(userCheckQuery, [identifier]);

            if (userCheckResult[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const user_id = userCheckResult[0][0].id;

            const userPresetMatch = await db.query('SELECT * FROM UserPreset WHERE user_id = ? AND preset_id = ?', [
                user_id,
                related_preset,
            ]);

            if (!userPresetMatch[0].length) {
                return res.status(400).json({ msg: 'Invalid preset for user' });
            }

            await db.query('INSERT INTO NotiLog (sent_at, related_preset) VALUES (?, ?)', [new Date(), related_preset]);

            res.json({ msg: 'Notification logged successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).send({ msg: 'Database error' });
        }
    },

    loadNotiLog: async ({ query, res }) => {
        const { type, identifier, offset, count } = query;
        const db = global.connection;

        if (!offset || !count || !type || !identifier) {
            return res.status(400).json({ msg: 'Required parameters are missing' });
        }

        if (parseInt(count) > 20 || parseInt(count) < 0 || parseInt(offset) < 0) {
            return res.status(400).json({ msg: 'Invalid count or offset' });
        }

        try {
            const userCheckQuery =
                type === 'id' ? 'SELECT id FROM User WHERE id = ?' : 'SELECT id FROM User WHERE UUID = ?';
            const userCheckResult = await db.query(userCheckQuery, [identifier]);

            if (userCheckResult[0].length === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }

            const user_id = userCheckResult[0][0].id;
            const presets = await db.query('SELECT * FROM UserPreset WHERE user_id = ?', [user_id]);

            const presetIds = presets[0].map(p => p.preset_id);

            const notiLogs = await db.query(
                'SELECT * FROM NotiLog WHERE related_preset IN (?) ORDER BY sent_at DESC LIMIT ? OFFSET ?',
                [presetIds, parseInt(count), parseInt(offset)]
            );

            const response = await Promise.all(
                notiLogs[0].map(async log => {
                    const memos = await db.query('SELECT * FROM MemoLog WHERE log_id = ?', [log.id]);
                    const preset_name = await db.query('SELECT * FROM AlarmPreset WHERE id = ?', [log.related_preset]);

                    return {
                        sent_at: log.sent_at,
                        preset_name: preset_name[0][0].name,
                        related_memo: memos[0],
                    };
                })
            );

            res.json(response);
        } catch (err) {
            console.error(err);
            res.status(500).send({ msg: 'Database error' });
        }
    },
};
