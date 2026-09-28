import { PoolClient } from 'pg';

export const updateData = async (
    tableName:string ,
    target_name_id:string ,
    target_id:number ,
    user_req: Record<string, string | number | boolean>, 
    transaction: PoolClient) => 
    {
        console.log('----- API action: Update Query -----');
    
        let current_index = 0;
        let sql = `UPDATE ${tableName} SET `;
        let values : any[] = [];
        Object.keys(user_req).forEach((key)=> {
            if(key === 'is_delete') return ;
            current_index++;
            sql += `${key} = $${current_index} ,`;
            values.push(user_req[key]);
        });
        values.push(target_id);
        sql = sql.slice(0, -1) + ` WHERE is_delete = FALSE AND ${target_name_id} = $${current_index+1};`;
        console.log('SQL :' , sql);
        console.log('values :' , values);
        try{
            const result = await transaction.query(sql, values);
            if(result.rowCount === 0){
                throw new Error('Failed to update group');
            }

            return { success: true, status: 200, data: result.rows[0] };
        }catch(error : any){
            if(error.code === '23505'){
                throw new Error(`This data in ${tableName} already exists. Please try again.`, { cause: error });
            }
            throw error;
        }
    }  