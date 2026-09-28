import { db } from '../Infra/connect_db.js';

export const getPage = async (
    tableName:string ,
    sort_by: string, 
    order: string,
    page: number, 
    limit: number) => {
        console.log('----- API action: Ready Query -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }
        if(!/^[a-zA-Z0-9_]+$/.test(tableName)){
            console.log('ชื่อตัวเลขที่กำหนดไม่ถูกต้อง');
            return { success: false, status: 400, error: 'Invalid table name' };
        }

        if(!/^[a-zA-Z0-9_]+$/.test(sort_by)){
            console.log('ลำดับที่กำหนดไม่ถูกต้อง');
            return { success: false, status: 400, error: 'Invalid order' };
        }

        const upperOrder = order.toUpperCase();
        if (upperOrder !== 'ASC' && upperOrder !== 'DESC') {
            return { success: false, status: 400, error: 'Order must be ASC or DESC' };
        }
        // const offset = (page - 1) * limit;
        const sql = `
            SELECT * FROM ${tableName} 
            WHERE is_delete = FALSE 
            ORDER BY ${sort_by} ${upperOrder}
            LIMIT $1 
            OFFSET $2`;
        
        try{
            const res = await db.query(sql , [limit , (page - 1) * limit]);
            if(res.rows.length === 0){
                console.log('❌ Not Found');
                return { success: false, status: 404, error: 'Not Found' };
            }

            console.log('----- Query Successful! -----');
            return { success: true, status: 200, data: res.rows };
        } catch (error) {
            console.error('❌ Database in getMqtt:', error);
            return { success: false, status: 500, error: 'Failed to get data Mqtt' };
        }
    }

export const getData = async (tableName:string , where : string , value:string | number ,has_is_delete:boolean) => {
        console.log('----- API action: getDataOne  -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }
        if(!/^[a-zA-Z0-9_]+$/.test(tableName)){
            console.log('ชื่อตัวเลขที่กำหนดไม่ถูกต้อง');
            return { success: false, status: 400, error: 'Invalid table name' };
        }
        if (!/^[a-zA-Z0-9_]+$/.test(where)) {
            return { success: false, status: 400, error: 'Invalid where column' };
        }

        let sql : string;
        
        if(has_is_delete){
            sql = `SELECT * FROM ${tableName} WHERE ${where} = $1 AND is_delete = FALSE;`;
        } else {
            sql = `SELECT * FROM ${tableName} WHERE ${where} = $1;`;
        }
        try { 
            const result = await db.query(sql, [value]);

            if (result.rowCount === 0) {
                return { success: false, status: 404, error: 'Record not found' };
            }
            console.log('---- Get Successful! -----');
            return { success: true, status: 200, data: result.rows[0] };
        } catch (error) {
            console.error('❌ Database in getDataOne:', error);
            return { success: false, status: 500, error: 'Failed to get data' };
        }
    }