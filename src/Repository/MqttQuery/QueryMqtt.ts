import { db } from '../../Connect_db/connect_db.js';

export const MqttQuery = {
    async getMqtt(page: number, limit: number) {
        console.log('----- API action: QueryMqtt service -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }
        const offset = (page - 1) * limit;
        const sql = `SELECT * FROM mqtt WHERE is_delete = FALSE ORDER BY Mqtt_id DESC LIMIT ${limit} OFFSET ${offset}`;
        
        try{
            const res = await db.query(sql);
            if(res.rows.length === 0){
                console.log('❌ Not Found');
                return { success: false, status: 404, error: 'Not Found' };
            }

            console.log('----- Query Successful! -----');
            return { success: true, status: 200, data: res.rows };
        } catch (error) {
            console.error('❌ Database in getMqtt:', error);
            return { success: false, status: 500, error: 'Failed to get data Mqtt' };
        }
    }
}