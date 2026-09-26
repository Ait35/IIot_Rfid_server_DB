import { fetch_data } from '../../External_api/pull_apt.js';
import { LoginQuery } from '../../Repository/userQuery/loginQuery.js';
import { ActivityLogService } from '../../Repository/Activity_Log/ActivityQuery.js';
import { Helper } from '../Group_service.js';
import  HelperService  from '../helper_func.js';

export class LoginService {
    static async login (university_id : string, password : string , ip:string , userAgent:string) {
        console.log('----- API action: signin service -----');

        try {
            //หาใน data base
            const res_db = await LoginQuery.Login(university_id , password);

            if(res_db.status !== 200 || res_db.data === 0){
                console.log(res_db.error);
                return res_db;
            }
            //ตรวจสอบ token ว่าไม่หมดอายุ ไม่หมดก็จบ fucntion
            const userInfo = res_db.data;
            await Helper.Query.updateTime('Users', 'last_login_at', 'user_id', userInfo.user_id);

            const auth = HelperService.verifyToken(userInfo.token)
            if(auth != null){//ไม่หมดอายุ
                console.log('---- Token is valid! ----');
                console.log(`--- stauts : ${res_db.status} ---`);

                ActivityLogService.Insert_logAction(userInfo.user_id, 'LOGIN', 'User', auth.user_id, {
                    university_id : userInfo.university_id,
                    role_at_login : userInfo.role,
                    ip_address : ip,
                    user_agent : userAgent
                });
                if(auth.user_id != userInfo.user_id){
                    console.log('Who token ?');
                    return {success : false, status : 401, error: `Who token ?`};
                }
                console.log('----- Add System Log Successful! -----');
                return res_db; //json เดิม เพราะ มี return เหมือนกันเป๊ะ
            }

            //หมดอายุเจนใหม่ แต่ต้องเช็คก่อนเผื่อไม่ได้เป็นคนของ ม. ละ แบบจบปี 4 งี้ 
            console.log("------- Fetch API ------");
            const res_api = await fetch_data(university_id);
            if(!res_api.data){ 
                console.log('not data from api');
                return {success : false,status : 400, error: 'not data from api'};
            }

            //data จาก api ตรวจสอบว่าเป็นคนของ ม. ไหม
            const profile = res_api.data;
            if(!profile.status || profile.status === 'graduated' || profile.status === 'suspended'){

                console.log(await Helper.Query.SetDelete('Users', 'user_id', userInfo.user_id , true));
                console.log('You are not student of university :' , university_id);
                return {success : false, status : 400, error: `You are not student of university : ${university_id}`};
            }

            //generate token ใหม่
            const result = await Helper.Query.updateToken(userInfo.user_id , HelperService.genToken(userInfo.user_id));
            if(!result.success){
                console.log(result.error);
                return result;
            }

            console.log(`--- stauts : ${result.status} ---`);
            console.log('✅Update Token Successful!');

            ActivityLogService.Insert_logAction(userInfo.user_id, 'LOGIN', 'User', userInfo.user_id, {
                    university_id : userInfo.university_id,
                    role_at_login : userInfo.role,
                    New_token : result.token,
                    ip_address : ip,
                    user_agent : userAgent
            });

            console.log('----- Add System Log Successful! -----');
            return result; //return Json 
        } catch (error) {
            console.error('❌ มีข้อผิดพลาดใน Service:', error);
            return { success: false, status: 500, error: 'Internal server error' };
        } 
    };
}