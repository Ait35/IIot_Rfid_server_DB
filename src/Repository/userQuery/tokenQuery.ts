import { db } from '../../Connect_db/connect_db.js';
import { genToken } from '../../service/helper_func.js';

export const updateToken = async (university_id:string, accessToken:string) => {
    console.log('----- API action: updateToken  -----');
    if(!university_id || !accessToken){
        console.log('Missing university id or token');
        console.log('university id :' , university_id);
        console.log('access token :' , accessToken);
        return { success: false, status: 400, error: 'Missing university id or token' };
    }
    if (!db) {
        return { success: false, status: 500, error: 'Database not connected' };
    }

    const sql = `
        UPDATE users SET token = $1 WHERE university_id = $2;
    `;
    const values = [accessToken, university_id];

    try { 
        const result = await db.query(sql, values); //ถ้า error ลง catch
        console.log('---- Set Successful! -----');
        return { success: true, status: 200, token : accessToken };
    }catch (error) {
        console.error('❌ Update Token error in user query:', error);
        return { success: false, status: 500, error: 'Update Token failed' };
    } 
};