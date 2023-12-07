export default {
    readUserPreset: async ({ query, res }) => {
        const { type, identifier } = query;
        const db = global.connection;

        if (!type || !identifier) {
            return res.status(400).json({ msg: 'Required parameters are missing' });
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

            const userPresets = await db.query('SELECT * FROM UserPreset WHERE user_id = ?', [user_id]);
            const presetIDs = userPresets[0].map(up => up.preset_id);

            if (presetIDs.length === 0) {
                return res.json([]); // 사용자에게 할당된 preset이 없는 경우
            }

            const presetsQuery = 'SELECT * FROM AlarmPreset WHERE id IN (?)';
            const presetsInfo = await db.query(presetsQuery, [presetIDs]);

            res.json(presetsInfo[0]);
        } catch (err) {
            console.log(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },
};
