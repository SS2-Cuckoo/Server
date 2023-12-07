export default {
    createAlarmPreset: async ({ body, res }) => {
        const { type, identifier, name, icon, alarm_time } = body;
        const db = global.connection;

        try {
            let userID;
            if (type === 'id') {
                userID = identifier;
            } else if (type === 'uuid') {
                const userResult = await db.query('SELECT id FROM User WHERE UUID = ?', [identifier]);
                if (userResult[0].length === 0) {
                    return res.status(404).json({ msg: 'User not found' });
                }
                userID = userResult[0][0].id;
            } else {
                return res.status(400).json({ msg: 'Invalid type' });
            }

            const existingPreset = await db.query('SELECT * FROM AlarmPreset WHERE name = ?', [name]);
            if (existingPreset[0].length > 0) {
                return res.status(409).json({ msg: 'Preset name already exists' });
            }

            const result = await db.query(
                'INSERT INTO AlarmPreset (name, icon, alarm_time, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
                [name, icon, alarm_time, new Date(), new Date()]
            );

            const newPresetID = result[0].insertId;
            await db.query('INSERT INTO UserPreset (user_id, preset_id) VALUES (?, ?)', [userID, newPresetID]);

            res.json({ msg: 'Alarm preset created and linked with user' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    readAlarmPresetByID: async ({ params, query, res }) => {
        const { type, identifier } = query;
        const { preset_id } = params;
        const db = global.connection;

        try {
            let userID;
            if (type === 'id') {
                userID = identifier;
            } else if (type === 'uuid') {
                const userResult = await db.query('SELECT id FROM User WHERE UUID = ?', [identifier]);
                if (userResult[0].length === 0) {
                    return res.status(404).json({ msg: 'User not found' });
                }
                userID = userResult[0][0].id;
            } else {
                return res.status(400).json({ msg: 'Invalid type' });
            }

            const userPreset = await db.query('SELECT * FROM UserPreset WHERE preset_id = ? AND user_id = ?', [
                preset_id,
                userID,
            ]);
            if (userPreset[0].length === 0) {
                return res.status(404).json({ msg: 'Preset not found for this user' });
            }

            const preset = await db.query('SELECT * FROM AlarmPreset WHERE id = ?', [preset_id]);
            res.json(preset[0][0]);
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    updateAlarmPresetByID: async ({ query, body, params, res }) => {
        const { type, identifier } = query;
        const { preset_id } = params;
        const { name, icon, alarm_time } = body;
        const db = global.connection;

        try {
            let userID;
            if (type === 'id') {
                userID = identifier;
            } else if (type === 'uuid') {
                const userResult = await db.query('SELECT id FROM User WHERE UUID = ?', [identifier]);
                if (userResult[0].length === 0) {
                    return res.status(404).json({ msg: 'User not found' });
                }
                userID = userResult[0][0].id;
            } else {
                return res.status(400).json({ msg: 'Invalid type' });
            }

            const userPreset = await db.query('SELECT * FROM UserPreset WHERE preset_id = ? AND user_id = ?', [
                preset_id,
                userID,
            ]);
            if (userPreset[0].length === 0) {
                return res.status(404).json({ msg: 'Preset not found for this user' });
            }

            const updateFields = {};
            if (name !== undefined) updateFields.name = name;
            if (icon !== undefined) updateFields.icon = icon;
            if (alarm_time !== undefined) updateFields.alarm_time = alarm_time;
            updateFields.updated_at = new Date();

            await db.query('UPDATE AlarmPreset SET ? WHERE id = ?', [updateFields, preset_id]);

            res.json({ msg: 'Alarm preset updated' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },

    deleteAlarmPreset: async ({ params, query, res }) => {
        const { type, identifier } = query;
        const { preset_id } = params;
        const db = global.connection;

        try {
            let userID;
            if (type === 'id') {
                userID = identifier;
            } else if (type === 'uuid') {
                const userResult = await db.query('SELECT id FROM User WHERE UUID = ?', [identifier]);
                if (userResult[0].length === 0) {
                    return res.status(404).json({ msg: 'User not found' });
                }
                userID = userResult[0][0].id;
            } else {
                return res.status(400).json({ msg: 'Invalid type' });
            }

            const userPreset = await db.query('SELECT * FROM UserPreset WHERE preset_id = ? AND user_id = ?', [
                preset_id,
                userID,
            ]);

            if (userPreset[0].length === 0) {
                return res.status(404).json({ msg: 'Preset not found for this user' });
            }

            const memoUsingPreset = await db.query('SELECT * FROM Memo WHERE noti_preset = ?', [preset_id]);
            if (memoUsingPreset[0].length > 0) {
                return res.status(400).json({ msg: 'Cannot delete preset as it is being used in memos' });
            }

            await db.query('DELETE FROM UserPreset WHERE preset_id = ?', [preset_id]);
            await db.query('DELETE FROM AlarmPreset WHERE id = ?', [preset_id]);

            res.json({ msg: 'Alarm preset and its references deleted successfully' });
        } catch (err) {
            console.error(err);
            res.status(500).json({ msg: 'Database error' });
        }
    },
};
