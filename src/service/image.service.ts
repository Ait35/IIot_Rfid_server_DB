import { Helper } from './Class_service.js';
import { InsertData } from '../Repository/insertQuery.js';
import { PoolClient } from 'pg';

interface Log_img { 
    log_id: string;
    camera_device_id : number;
    image_path: string;
}

export const ImageService = {
    async processUploadedImage(log_id: string , device_id: number , imagePath: string) {
        console.log('----- API action: UploadedImage service -----');
        try{
            //ส่ง ecp / log id มา เอามาเช็ค cache ถ้าไม่เจอก็เข้าไปหาใน log rfid 
            const result = await Helper.Service.ChackCacheAndSave('log_id', log_id, 'log_rfid', 'log_id' , false);
            //return ค่าของ log_rfid ออกมาหมดเลย
            if(!result.success){
                console.log(result);
                return result;
            }
            const log_img : Log_img = {
                log_id,
                camera_device_id :device_id,
                image_path : imagePath
            }
            
            return await Helper.Service.executeWithLog('UploadedImage service', 'log_images', 'INSERT', null ,
                async (transaction: PoolClient)=>{
                    const result = await InsertData('log_images', log_img, transaction);

                    return {
                        result,
                        recordId: result.data.image_id,
                        logPayload: log_img
                    }
                });
        }catch(error){
            console.error('Error occurred while checking cache or fetching data from database:', error);
            throw error;
        }
    }
}