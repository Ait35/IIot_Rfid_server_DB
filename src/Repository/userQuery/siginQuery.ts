import { db } from '../../Connect_db/connect_db.js';
// import HelperService from '../../service/helper_func.js';
// import {HelperQuery} from '../helperQuery.js';

export const SiginQuery = {
    async insertUser (university_id:string, password:string, role:string ,
        first_name:string , last_name:string ){

        console.log('----- API action: insertUser  -----');
        if (!db) {
            return { success: false, status: 500, error: 'Database not connected' };
        }
        // chack ว่าโดน soft delete ไหม
        if(await softDelete(university_id , db)){
            console.log('----- Is old user -----');  
            const sql_Update = `UPDATE users SET is_delete = FALSE WHERE university_id = $1
            RETURNING *;`;
            const result = await db.query(sql_Update, [university_id]);
            if(result.rowCount === 0){
                return { success: false, status: 400, error: `Failed to insert user` };
            }
            console.log('----- Activate old Account -----');
            return { success: true, status: 200, data: result.rows[0] };
        }

        const sql = `
            INSERT INTO users (university_id, password, role, first_name, last_name) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *;
        `;
        const values = [university_id, password, role, first_name, last_name ];

        try { 
            const result = await db.query(sql, values);

            if (result.rows.length === 0) {
                return { success: false, status: 400, error: `Failed to insert user` };
            }
            
            console.log('----- Insert Successful! -----');
            return { success: true, status: 200, data: result.rows[0] };

        } catch (error : any) {
            console.error('❌ Database error in user query:', error);
            if(error.code === '23505'){
                return { success: false, status: 400, error: `User already exist` };
            }
            return { success: false, status: 500, error: 'error in user query' };
        } 
    },

}

const softDelete = async (university_id:string , db : any) => {
    const sql_is_delete = `SELECT * FROM users WHERE university_id = $1 AND is_delete = TRUE;`;
    const is_delete = await db.query(sql_is_delete, [university_id]);
    if(!is_delete.rows[0]){
        return false;
    }
    return true;
};

