import { MqttQuery } from '../Group_service.js'
import { db } from '../../Connect_db/connect_db.js';
import { ActivityLogService } from '../../Repository/Activity_Log/ActivityQuery.js';
import { Helper } from '../Group_service.js';

export const MqttWrite = {
    async post_mqtt(topic:string ,Config_device_id:string , By_user_id:string, 
        User_Mqtt:string | null = null , Pass_Mqtt:string | null = null , ip:string , userAgent:string) {

        console.log('----- API action: post_mqtt service -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }
        const transaction = await db.connect();

        try{
            await transaction.query('BEGIN');
            const res_query = await MqttQuery.QueryWrite.insertMqtt(topic, Config_device_id, By_user_id, 
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
    },
    //Updata
    async update_mqtt(
        mqtt_id: number,
        topic: string | undefined, 
        by_user_id: string,
        config_device_id: string | undefined,
        user_mqtt: string | undefined,
        pass_mqtt: string | undefined,
        ip: string, 
        userAgent: string,
        is_delete: boolean | undefined)
    {
        console.log('----- API action: update_mqtt service -----');
        console.log(mqtt_id, by_user_id);
        interface user_req {
            mqtt_id: number;
            config_device_id?: string;
            topic? : string;
            user_mqtt? : string
            Pass_Mqtt? : string
            is_delete? : boolean
        }
        const user_req : user_req = {
            mqtt_id : mqtt_id
        }

        if (topic !== undefined) user_req.topic = topic;
        if (config_device_id !== undefined) user_req.config_device_id = config_device_id;
        if (user_mqtt !== undefined) user_req.user_mqtt = user_mqtt;
        if (pass_mqtt !== undefined) user_req.Pass_Mqtt = pass_mqtt;
        if (is_delete !== undefined) user_req.is_delete = is_delete;

        if(!topic && (user_mqtt || pass_mqtt) ) return { success: false, status: 400, error: 'can not update user/pass mqtt without topic' };
        if(pass_mqtt && !user_mqtt) return { success: false, status: 400, error: 'can not update pass mqtt without user mqtt' };

        console.log(user_req);
        if(!db) return { success: false, status: 500, error: 'Database not connected' };
        let result : any;
        const transaction = await db.connect();
        try{
            await transaction.query('BEGIN');

            if(is_delete !== null && is_delete !== undefined){
                result = await Helper.Query.Tran_SetDelete('mqtt', 'By_user_id', Number(by_user_id) , is_delete , transaction);
            }else{
                result = await MqttQuery.QueryWrite.updateMqtt(user_req as any , transaction);
                console.log('----- Update Successful! -----');
            }
            
            await ActivityLogService.Insert_logAction(Number(by_user_id), 'UPDATE', 'Mqtt', mqtt_id, {
                topic : topic,
                config_device_id: config_device_id,
                user_mqtt: user_mqtt,
                pass_mqtt: pass_mqtt,
                ip_address : ip,
                user_agent : userAgent

            }, transaction);

            await transaction.query('COMMIT');
            console.log('----- Add System Log Successful! -----');
            return result;
        }catch(error : any){
            await transaction.query('ROLLBACK');
            console.error('❌ Database ROLLBACK :', error);
            throw error;
        }finally{
            transaction.release();
        }
    }
}