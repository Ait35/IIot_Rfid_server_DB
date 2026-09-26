import { fetch_data } from '../../External_api/pull_apt.js';
import { SiginQuery } from '../../Repository/userQuery/siginQuery.js';
import { Helper } from '../Group_service.js';
import HelperService from '../helper_func.js';
import { ActivityLogService } from '../../Repository/Activity_Log/ActivityQuery.js';

export class SiginService {
    static async sigin(university_id : string, password : string , ip:string , userAgent:string) {
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
            // insert user
            const result = await SiginQuery.insertUser (
                university_id, 
                password, 
                profile.role, 
                profile.first_name, 
                profile.last_name
            );

            if(!result.success){
                console.log(result.error);
                return result;
            }
            //Generate Token ใหม่
            const accessToken = await Helper.Query.updateToken(result.data.user_id , HelperService.genToken(result.data.user_id));
            if(!accessToken.success){
                console.log(accessToken.error);
                return accessToken;
            }
            
            console.log(`--- status : ${result.status} ---`);

            ActivityLogService.Insert_logAction(result.data.user_id, 'SIGIN', 'User', result.data.user_id, {
                university_id : university_id,
                role_at_login : profile.role,
                ip_address : ip,
                user_agent : userAgent
            });

            console.log('----- Add System Log Successful! -----');
            return result; //return Json 
        } catch (error) {
            console.error('❌ มีข้อผิดพลาดใน Service:', error);
            return { success: false, status: 500, error: 'Internal server error' };
        };
    };
};