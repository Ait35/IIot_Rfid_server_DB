import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {PoolClient} from 'pg';
import { db } from '../Infra/connect_db.js';
import { ActivityLogService } from '../Repository/Activity_Log/ActivityQuery.js';

export interface ITokenPayload {
    user_id: string; //ให้ สัญญาวาเป็นรูปแบบ ojb นี้แน่นอน
}

const Service = {
    genToken (user_id : string){
        const token = jwt.sign(
            { user_id }, // ยัด ีuser id ไว้
            process.env.JWT_SECRET!,
            { expiresIn: '1d' } // หมดอายุใน 1 วัน
        );
        return token;
    },

    verifyToken (token: string){
        try {
            // jwt.verify จะคืนค่า Object Payload ที่เรายัดไว้ตอนแรกออกมา
            const decoded = jwt.verify(token, process.env.JWT_SECRET!)  as ITokenPayload; //ให้ สัญญาวาเป็นรูปแบบ ojb นี้แน่นอน
    
            return decoded; 
        } catch (error) {
            console.log('Token expired or invalid');
            return null; // ถ้าพัง คืนค่า null 
        }
    },
    GenKeyApi (){
        const randomString = crypto.randomBytes(32).toString('hex');
        return `dev_${randomString}`;
    },
    async readAndWriteLog (
        actionName : string,
        table : string,
        by_user_id: number,
        Callfunction:() => Promise<{ result: any; logPayload: any }>)
    {
        console.log(`----- API action: ${actionName} -----`);
         
        try{
            const {result, logPayload} = await Callfunction();
            // ตรวจสอบว่าเป็น Array ไหม ถ้าไม่ใช่ให้แปลงเป็น Array ชั่วคราวเพื่อทำ map
            const isArray = Array.isArray(result);
            const data = isArray ? result : [result];

            const cleanData = data.map((Item : any)=>{
                const {first_name , ...temp} = Item;
                return {...temp , by_user_name : first_name }; 
            });

            const System_log = await ActivityLogService.Insert_logAction(
                Number(by_user_id),
                'GET',
                table, 
                null, 
                logPayload
            );
            if(!System_log.success){
                console.log(System_log);
                return System_log;
            }

            console.log('----- Add System Log Successful! -----');
            console.log(' ✅ Get Successful! ');
            return { success: true, status: 200, data: isArray ? cleanData : cleanData[0] };
        }catch(error : any){
            console.error(`❌ Database ROLLBACK [${table} - GET]:`,error);
            return { success: false, status: error.status || 500, error: error.message };
        }
    },
    async executeWithLog (
        actionName: string, // ชื่อ API เอาไว้ log console
        table: string,
        action: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE',
        by_user_id: string,
        Callfunction: (transaction: PoolClient) => Promise<{ result: any; recordId: number; logPayload: any }> //Promise คือ async ที่จะ return มาให้ สัญญาวาเป็น Promise
    ) {
        console.log(`----- API action: ${actionName} -----`);
        if (!db) return { success: false, status: 500, error: 'Database not connected' };

        const transaction = await db.connect();
        try {
            await transaction.query('BEGIN');

            const { result, recordId, logPayload } = await Callfunction(transaction);

            await ActivityLogService.Insert_logAction(
                Number(by_user_id),
                action,
                table,
                recordId, //มันคือ target_id 
                logPayload,
                transaction
            );

            await transaction.query('COMMIT');
            console.log(`----- ${action} ${table} Successful! -----`);
            
            return result;
        } catch (error) {
            await transaction.query('ROLLBACK');
            console.error(`❌ Database ROLLBACK [${table} - ${action}]:`, error);
            throw error; 
        } finally {
            transaction.release();
        }
    }
}

export default Service;