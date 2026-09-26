import { MqttQuery } from '../../Repository/MqttQuery/insertMqtt.js';
import { db } from '../../Connect_db/connect_db.js';
import { ActivityLogService } from '../../Repository/Activity_Log/ActivityQuery.js';

export const Mqttpost = {
    async post_mqtt(topic:string ,Config_device_id:string , By_user_id:string, 
        User_Mqtt:string | null = null , Pass_Mqtt:string | null = null , ip:string , userAgent:string) {

        console.log('----- API action: post_mqtt service -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }
        const transaction = await db.connect();

        try{
            await transaction.query('BEGIN');
            const res_query = await MqttQuery.insertMqtt(topic, Config_device_id, By_user_id, 
                User_Mqtt , Pass_Mqtt , transaction);
            console.log('----- Insert Successful! -----');

            await ActivityLogService.Insert_logAction(Number(By_user_id), 'MQTT', 'Mqtt', Config_device_id, {
                topic : topic,
                ip_address : ip,
                user_agent : userAgent
            }, transaction);
            await transaction.query('COMMIT');

            console.log('----- Add System Log Successful! -----');
            return res_query;
        } catch (error) {
            await transaction.query('ROLLBACK');
            console.error('❌ Database ROLLBACK :', error);
            return { success: false, status: 500, error: 'Failed to insert table Mqtt' };
        }finally{
            transaction.release();
        }
    }
}