import { db } from '../Connect_db/connect_db.js';

export const Query = {
    async updateToken (user_id:string, accessToken:string){
        console.log('----- API action: updateToken  -----');
        if(!user_id || !accessToken){
            console.log('Missing university id or token');
            console.log('user id :' , user_id);
            console.log('access token :' , accessToken);
            return { success: false, status: 400, error: 'Missing university id or token' };
        }
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }

        const sql = `
            UPDATE users SET token = $1 WHERE user_id = $2;
        `;
        const values = [accessToken, user_id];

        try { 
            const result = await db.query(sql, values); //ถ้า error ลง catch
            console.log(result);
            if (result.rowCount === 0) {
                return { success: false, status: 404, error: 'Record not found' };
            }
            console.log('---- Set Successful! -----');
            return { success: true, status: 200, token : accessToken };
        }catch (error) {
            console.error('❌ Update Token error in user query:', error);
            return { success: false, status: 500, error: 'Update Token failed' };
        } 
    },
    
    async updateTime(tableName:string , field_traget : string, where : string , id:number) {
        console.log('----- API action: updateTime  -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }
        //ใช้รูแบบ $1 กับพวก table  field where ไม่ได้
        const sql = `
            UPDATE ${tableName} SET ${field_traget} = NOW()
            WHERE ${where} = $1
            RETURNING ${field_traget};
            `; // user_id ไม่ใช่หรัสนักศึกษาโว้ยยย
        const values = [id];
        try { 
            const result = await db.query(sql , values);
            if (result.rowCount === 0) {
                return { success: false, status: 404, error: 'Record not found' };
            }

            console.log('---- Update Successful! -----');
            return { success: true, status: 200, time_updated : result.rows[0][field_traget] };
        }catch (error) {
            console.error('❌ Update Time error in user query:', error);
            return { success: false, status: 500, error: 'Update Time failed' };
        } 
    },

    async SetDelete(tableName:string , where : string , id:number , is_delete : boolean) {
        console.log('----- API action: SetDelete  -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }
        const sql = `
            UPDATE ${tableName} SET  is_delete = $2
            WHERE ${where} = $1
            RETURNING is_delete;
            `;
        const values = [id , is_delete];

        try { 
            const result = await db.query(sql , values);

            if (result.rowCount === 0) {
                return { success: false, status: 404, error: 'Record not found' };
            }

            if(is_delete){
                console.log('---- Delete Successful! -----');
            }else{
                console.log('---- Restore Successful! -----');
            }
            return { success: true, status: 200, is_delete : result.rows[0].is_delete };
        }catch (error) {
            if(is_delete){
                console.log('---- Delete failed! -----');
                return { success: false, status: 500, error: 'Delete failed' };
            }

            console.log('---- Restore failed! -----');
            return { success: false, status: 500, error: 'Restore failed' };
        }
    }
}