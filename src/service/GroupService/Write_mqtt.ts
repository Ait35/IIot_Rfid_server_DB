// import { GroupQuery } from '../Class_service.js'
import { db } from '../../Connect_db/connect_db.js';
import { ActivityLogService } from '../../Repository/Activity_Log/ActivityQuery.js';
import { Helper } from '../Class_service.js';
import { InsertData } from '../../Repository/insertQuery.js';
import { updateData } from '../../Repository/updataQuery.js';

interface user_req {
    group_name?: string;
    by_user_id?: string
}

export const GroupWrite = {
    async post_group(group_name : string, By_user_id: string, ip:string , userAgent:string) {

        console.log('----- API action: post_group service -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }
        const req : user_req = {
            group_name : group_name,
            by_user_id : By_user_id
        }
        const transaction = await db.connect();

        try{
            await transaction.query('BEGIN');
            const res_query = await InsertData('device_group', req as any , transaction);
            console.log('----- Insert Successful! -----');

            await ActivityLogService.Insert_logAction(Number(By_user_id), 'INSERT', 'device_Group', res_query.data.Group_id, { 
                group_name : group_name,
                ip_address : ip,
                user_agent : userAgent
            }, transaction);
            await transaction.query('COMMIT');

            console.log('----- Add System Log Successful! -----');
            return res_query;
        } catch (error) {
            await transaction.query('ROLLBACK');
            console.error('❌ Database ROLLBACK :', error);
            return { success: false, status: 500, error: 'Failed to insert table device_Group' };
        }finally{
            transaction.release();
        }
    },
    async update_group(
        group_id : number, 
        group_name : string | undefined = undefined,
        by_user_id: string,
        ip:string , 
        userAgent:string , 
        is_delete: boolean | undefined = undefined)
    {
        interface req  {
            group_name?: string;
            is_delete?: boolean
        }
        const req : req = {
            ...(group_name !== undefined && {group_name}),
            ...(is_delete !== undefined && {is_delete})
        }

        console.log('----- API action: update_group service -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        } 
        let result : any;
        const transaction = await db.connect();
    
        try{
            await transaction.query('BEGIN');
            if(is_delete !== null && is_delete !== undefined){
                result = await Helper.Query.Tran_SetDelete('device_group', 'group_id', group_id , is_delete , transaction);

            }else{
                result = await updateData('device_group', 'group_id', group_id , req as any , transaction);
                console.log('----- Update Successful! -----');
            }

            await ActivityLogService.Insert_logAction(Number(by_user_id), 'UPDATE', 'device_Group', group_id, { 
                group_name : group_name,
                ip_address : ip,
                user_agent : userAgent
            }, transaction);
            await transaction.query('COMMIT');

            console.log('----- Add System Log Successful! -----');
            return result;
        } catch (error) {
            await transaction.query('ROLLBACK');
            console.error('❌ Database ROLLBACK :', error);
            throw error;
        }finally{
            transaction.release();
        }
    }
}