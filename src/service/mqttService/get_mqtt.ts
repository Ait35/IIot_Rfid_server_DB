import { MqttQuery } from '../../Repository/MqttQuery/QueryMqtt.js';
import { ActivityLogService } from '../../Repository/Activity_Log/ActivityQuery.js';

 export const Mqttget = {
    async get_mqtt(page: number, limit: number, userId: number, ip: string, userAgent: string) {
        console.log('----- API action: get_mqtt service -----');
        try{
            const res_query = await MqttQuery.getMqtt(page , limit );
            if(!res_query.success){
                console.log(res_query);
                return res_query;
            }
            console.log('data :' , res_query.data);
            const System_log = await ActivityLogService.Insert_logAction(userId, 'GET', 'Mqtt', null, {
                strat_at : (page - 1) * limit,
                limit : limit,
                ip_address : ip,
                user_agent : userAgent
            });

            if(!System_log.success){
                console.log(System_log);
                return System_log;
            }
            console.log('----- Add System Log Successful! -----');
            console.log(' ✅ Get Successful! ');
            return res_query;
        } catch (error) {
            console.error('❌ Database in get_mqtt:', error);
            return { success: false, status: 500, error: 'Failed to get data Mqtt' };
        }
    }
    
}