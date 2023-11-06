import mysql from "mysql2/promise";
import config from "../config/index.js";

async function connect() {
    if (global.connection && global.connection.state !== "disconnected") {
        return global.connection;
    }

    const connection = await mysql.createConnection({
        database: config.DB_NAME,
        host: config.DB_HOST,
        password: config.DB_PW,
        port: config.DB_PORT,
        user: config.DB_ID,
    });

    global.connection = connection;
    return connection;
}

export default connect;
