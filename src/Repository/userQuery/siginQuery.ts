import {PoolClient} from 'pg';
// import {HelperQuery} from '../helperQuery.js';

export const SiginQuery = {
    async insertUser (university_id:string, password:string, role:string ,
        first_name:string , last_name:string , transaction: PoolClient){

        console.log('----- API action: insertUser  -----');
        // chack ว่าโดน soft delete ไหม
        if(await softDelete(university_id , transaction)){
            console.log('----- Is old user -----');  
            const sql_Update = `UPDATE users SET is_delete = FALSE WHERE university_id = $1
            RETURNING User_id, university_id, first_name, last_name, role, token;`;

            const result = await transaction.query(sql_Update, [university_id]);
            if(result.rowCount === 0){
                throw new Error('Failed to insert user');
            }
            console.log('----- Activate old Account -----');
            return { success: true, status: 200, data: result.rows[0] };
        }

        const sql = `
            INSERT INTO users (university_id, password, role, first_name, last_name) 
            VALUES ($1, $2, $3, $4, $5)
            RETURNING User_id, university_id, first_name, last_name, role, token;
        `;
        const values = [university_id, password, role, first_name, last_name ];

        try { 
            const result = await transaction.query(sql, values);

            if (result.rows.length === 0) {
                throw new Error('Failed to insert user');
            }
            
            console.log('----- Insert Successful! -----');
            return { success: true, status: 200, data: result.rows[0] };
        } catch (error : any) {
            console.error('❌ Database error :', error);
            if(error.code === '23505'){
               throw new Error(`User already exist`);
            }
            throw error;
        } 
    },

}

const softDelete = async (university_id:string , transaction: PoolClient) => {
    const sql_is_delete = `SELECT 1 FROM users WHERE university_id = $1 AND is_delete = TRUE;`;
    const is_delete = await transaction.query(sql_is_delete, [university_id]);
    if(!is_delete.rows[0]){
        return false;
    }
    return true;
};

