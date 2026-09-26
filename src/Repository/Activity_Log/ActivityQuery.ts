import {db} from '../../Connect_db/connect_db.js';

export class ActivityLogService {
    static async Insert_logAction(userId: number | null, actionType: string, targetTable: string , targetId: number | null, payload: any) {
        try {
            if(!db) throw new Error('ไม่มีการเชื่อมต่อกับ DB ได้');
            
            await db.query(
                `INSERT INTO activity_log (User_id, action_type, target_table, target_id, payload)
                 VALUES ($1, $2, $3, $4 , $5)`,
                [userId, actionType, targetTable, targetId, JSON.stringify(payload)] // แปลง Object เป็น JSON String ก่อนลง DB
            );
        } catch (error) {
            console.error('Failed to write audit log:', error);
            // ปกติ Audit Log พัง เราจะไม่หยุดการทำงานหลักของระบบ
        }
    }
}