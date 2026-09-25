import { fetch_data } from '../External_api/pull_apt.js';
import { findUser } from '../Repository/userQuery/loginQuery.js';
import { updateToken } from '../Repository/userQuery/tokenQuery.js';
import { verifyToken } from '../service/helper_func.js';
import { genToken } from '../service/helper_func.js';

export const login_service = async (university_id : string, password : string) => {
    console.log('----- API action: signin service -----');

    try {
        //หาใน data base
        const res_db = await findUser(university_id , password);

        if(res_db.status !== 200){
            console.log(res_db.error);
            return res_db;
        }
        //ตรวจสอบ token ว่าไม่หมดอายุ ไม่หมดก็จบ fucntion
        const userInfo = res_db.data;
        if(verifyToken(userInfo.token)){
            console.log('---- Token is valid! ----');
            console.log(`--- stauts : ${res_db.status} ---`);
            return res_db; //json เดิม เพราะ มี return เหมือนกันเป๊ะ
        }

        //หมดอายุเจนใหม่ แต่ต้องเช็คก่อนเผื่อไม่ได้เป็นคนของ ม. ละ แบบจบปี 4 งี้ 
        const res_api = await fetch_data(university_id);
        if(!res_api.data){ 
            console.log('not data from api');
            return {success : false,status : 400, error: 'not data from api'};
        }

        //data จาก api
        const profile = res_api.data;
        if(!profile.status || profile.status === 'graduated' || profile.status === 'suspended'){
            console.log('You are not student of university :' , university_id);
            return {success : false, status : 400, error: `You are not student of university : ${university_id}`};
        }

        const result = await updateToken(university_id ,genToken(university_id));
        if(!result.success){
            console.log(result.error);
            return result;
        }

        console.log(`--- stauts : ${result.status} ---`);
        console.log('✅Update Token Successful!');
        return result; //return Json 
    } catch (error) {
        console.error('❌ มีข้อผิดพลาดใน Service:', error);
        return { success: false, status: 500, error: 'Internal server error' };
    };
};