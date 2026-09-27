import { DeviceQuery } from '../Group_service.js'
import { ActivityLogService } from '../../Repository/Activity_Log/ActivityQuery.js';
import { db } from '../../Connect_db/connect_db.js';

export const DeviceWrite = {
    async post_device(device_name : string, mac : string, local : string , by_user_id: string,
        ip_address : string, userAgent: string) {
        console.log('----- API action: post_mqtt service -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }
        const transaction = await db.connect();

        try{
            await transaction.query('BEGIN');
            const res_query = await DeviceQuery.QueryWrite.insertDevice(
                device_name, 
                mac, 
                local , 
                by_user_id , 
                undefined, undefined , undefined, 
                transaction
            );
            console.log('----- Insert Successful! -----');

            await ActivityLogService.Insert_logAction(Number(by_user_id), 'INSERT', 'device_info',res_query.data.device_id, {
                device_name : device_name,
                mac : mac,
                local : local,
                ip_address : ip_address,
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
}