import { fetch_data } from '../External_api/pull_apt.js';
import { insertUser } from '../Repository/userQuery/siginQuery.js';
import { genToken } from '../service/helper_func.js';

export const sigin_service = async (university_id : string, password : string) => {
    console.log('----- API action: signin service -----');

    try {
        //ดึง api ม. ต้องเปลี่ยนในอนาคต
        const res_api = await fetch_data(university_id);
        if(!res_api.success){
            console.log('not found university id :' , university_id);
            return {success : false, status : 400, error: `Invalid university id: ${university_id}`};
        }
        if(!res_api.data){ 
            console.log('not data from api');
            return {success : false,status : 400, error: 'not data from api'};
        }

        //data จาก api
        const profile = res_api.data;
        if(!profile.role || !profile.first_name || !profile.last_name){
            console.log('not found role or first name or last name');
            return {success : false, status : 400 , error: 'not found role or first name or last name'};
        }
        if(!profile.status || profile.status === 'graduated' || profile.status === 'suspended'){
            console.log('You are not student of university :' , university_id);
            return {success : false, status : 400, error: `You are not student of university : ${university_id}`};
        }
        const accessToken = genToken(university_id);
       //call service ชื่อคล้าย เดี่ยวลืม
        const result = await insertUser (
            university_id, 
            password, 
            profile.role, 
            profile.first_name, 
            profile.last_name,
            accessToken
        );
        console.log(`--- status : ${result.status} ---`);
        return result; //return Json 
    } catch (error) {
        console.error('❌ มีข้อผิดพลาดใน Service:', error);
        return { success: false, status: 500, error: 'Internal server error' };
    };
};