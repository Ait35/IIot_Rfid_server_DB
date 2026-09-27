import { db } from '../../Connect_db/connect_db.js';
import { PoolClient } from 'pg';

export const updateMqtt = async (
    user_req: Record<string, string | number | boolean>, 
    transaction: PoolClient) => 
    {
        console.log('----- API action: Update Mqtt Query -----');
    
        let current_index = 0;
        let sql = `UPDATE mqtt SET `;
        let values : any[] = [];
        Object.keys(user_req).forEach((key)=> {
            if(key === 'mqtt_id' || key === 'is_delete') return ;
            current_index++;
            sql += `${key} = $${current_index} , `;
            values.push(user_req[key]);
        });
        values.push(user_req.mqtt_id);
        sql += `is_delete = FALSE WHERE mqtt_id = $${current_index+1};`;
        console.log('SQL :' , sql);
        console.log('values :' , values);
        try{
            const result = await transaction.query(sql, values);
            if(result.rowCount === 0){
                throw new Error('Failed to update mqtt');
            }

            return { success: true, status: 200, data: result.rows[0] };
        }catch(error : any){
            if(error.code === '23505'){
                throw new Error(`Device is config already try again : ` , error);
            }
            throw error;
        }
    }  