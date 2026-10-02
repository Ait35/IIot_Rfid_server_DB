import { PoolClient } from 'pg';
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

export const getData = async (
    tableName:string , 
    where : string , 
    value:string | number ,
    has_is_delete:boolean , 
    transaction?: PoolClient) => 
    {
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
            const result = transaction ? await transaction.query(sql, [value]) : await db.query(sql, [value]);

            if (result.rowCount === 0) {
                return { success: true, status: 404, data: null };
            }
            console.log('---- Get Successful! -----');
            return { success: true, status: 200, data: result.rows[0] };
        } catch (error) {
            console.error('❌ Database in getDataOne:', error);
            return { success: false, status: 500, error: 'Failed to get data' };
        }
    }
export const get2TablePage = async (
    table1:string ,
    table2:string ,
    SelectT1:string,
    SelectT2:string,
    OnT1:string,
    OnT2:string ,
    sort_by: string, 
    order: string,
    page: number, 
    limit: number) =>
    {
        console.log('----- API action: Ready Query -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }

        const ErrorWord = /^[a-zA-Z0-9_*]+$/;
        if(!ErrorWord.test(table1) || !ErrorWord.test(table2)){
            console.log('Table has Error Word');
            return { success: false, status: 400, error: 'Invalid table name' };
        }
        if(!ErrorWord.test(SelectT1) || !ErrorWord.test(SelectT2)){
            console.log('Select has Error Word');
            return { success: false, status: 400, error: 'Invalid Select column' };
        }
        if (!ErrorWord.test(OnT1) || !ErrorWord.test(OnT2)){
            console.log('Join on has Error Word');
            return { success: false, status: 400, error: 'Invalid Join on column' };
        }
        if(!ErrorWord.test(sort_by) || !ErrorWord.test(order)){
            console.log('ลำดับที่กำหนดไม่ถูกต้อง');
            return { success: false, status: 400, error: 'Invalid order or sort' };
        }

        const upperOrder = order.toUpperCase();
        if (upperOrder !== 'ASC' && upperOrder !== 'DESC') {
            return { success: false, status: 400, error: 'Order must be ASC or DESC' };
        }

        const sql = `
            SELECT T1.${SelectT1}, T2.${SelectT2} FROM ${table1} AS T1
            LEFT JOIN ${table2} AS T2 ON T1.${OnT1} = T2.${OnT2}
            WHERE T1.is_delete = FALSE AND T2.is_delete = FALSE
            ORDER BY T1.${sort_by} ${upperOrder}
            LIMIT $1 
            OFFSET $2
            `;
        console.log(sql);
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
