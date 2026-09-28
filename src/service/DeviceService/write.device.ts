// import { DeviceQuery } from '../Class_service.js'
import { Helper } from '../Class_service.js';
import { ActivityLogService } from '../../Repository/Activity_Log/ActivityQuery.js';
import { db } from '../../Infra/connect_db.js';
import { InsertData } from '../../Repository/insertQuery.js';

interface user_req {
    key_api: string;
    device_name: string;
    mac: string;
    local: string;
    group_id: number;
    device_type: string;
    by_user_id: string
    ip: string
    gate_way : string
    subnet : string
 } //uptime / status ค่อยรอจาก update

export const DeviceWrite = {
    async post_device(device_name : string, mac : string, local : string , by_user_id: string, group_id : number,
        type : string, ip_address : string, userAgent: string) {
        console.log('----- API action: post_mqtt service -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }
        const req : user_req = {
            key_api : Helper.Service.GenKeyApi(),
            device_name,
            mac,
            local,
            group_id,
            device_type : type,
            by_user_id,
            ip : "127.0.0.1",
            gate_way : "127.0.0.1",
            subnet : "255.255.255.0"
        }
        const transaction = await db.connect();

        try{
            await transaction.query('BEGIN');
            const res_query = await InsertData('Device_info', req as any , transaction);

            console.log('----- Insert Successful! -----');

            await ActivityLogService.Insert_logAction(Number(by_user_id), 'INSERT', 'device_info',res_query.data.device_id, {
                device_name : device_name,
                mac : mac,
                group_id : group_id,
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