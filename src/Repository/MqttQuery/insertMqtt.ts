import { db } from '../../Connect_db/connect_db.js';

export const MqttQuery = {
    async insertMqtt(topic:string ,Config_device_id:string , By_user_id:string, 
        User_Mqtt: string | null = null , Pass_Mqtt: string | null = null , transaction:any) {

        console.log('----- API action: insertMqtt service -----'); //By_user_id จะเกะจาก token
        if(!db) throw new Error('ไม่มีการเชื่อมต่อกับ DB ได้');
    
        const sql = `
            INSERT INTO mqtt (topic, config_device ,By_user_id, User_Mqtt, Pass_Mqtt)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [topic , Config_device_id, By_user_id , User_Mqtt, Pass_Mqtt];

        const result = await transaction.query(sql, values);

        return { success: true, status: 200, data: result.rows[0] };
    }
}