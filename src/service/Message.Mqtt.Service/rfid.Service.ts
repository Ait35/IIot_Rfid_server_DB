import { InsertData } from '../../Repository/insertQuery.js';
import { Helper } from '../Class_service.js';
import { publishMessage } from '../../Infra/Mqtt.infra.js';
import { PoolClient } from 'pg';
import { QueryRedis } from '../../Infra/Redis/cache.js';
import { ActivityLogService } from '../../Repository/Activity_Log/ActivityQuery.js';

export const insertRfidLog = async ( payload: any, dataOJB:any ,logOJB : any, TopicCam: string ) => {
        try{
        console.log("----- InsertRfidLog chack Cache -----");
        const cache_result = await Helper.Service.ChackCacheAndSave('epc', dataOJB.epc, 'map_tag', 'epc');
        await triggerCAM(TopicCam , dataOJB.epc);
        if(cache_result.success){
            console.log('----- Data in found in DB or cache -----');
            
            return await Helper.Service.executeWithLog('Insert log_rfid', 'log_rfid', 'INSERT', null ,
                async (transaction: PoolClient)=>{
                    //เอา ecp id ที่เจอใน cache โดยที่ไม่ต้องลง DB เพื่อไปดูว่า ecp นี้ id, tag อะไร
                    //แต่ถ้าไม่เจอใน cache จะต้องลง DB ใน ChackCacheAndSave มีการหาใน DB อยู่แล้ว แล้ว save ลง cache ไปเลย
                    logOJB.epc_id = cache_result.data.epc_id;
                    const insert_log= await InsertData('log_rfid', logOJB, transaction);

                    return {
                        result: cache_result,
                        recordId: insert_log.data.log_id , // ส่ง ID กลับไปให้ Helper ทำ Log
                        logPayload: { 
                            device_id: payload.device_id,
                            ip_address: payload.ip, 
                            mac_address: payload.mac
                        }
                    };
                }
            );
        }  
        //กรณีที่ ecp ไม่พบใน cache, DB มันจะ insert ecp
        console.log('----- Data not found in DB or cache -----');
        return await Helper.Service.executeWithLog('Insert map_Tag', 'map_tag', 'INSERT', null , 
            async (transaction: PoolClient)=>{
                const res_query = await InsertData('map_tag', dataOJB, transaction);
                logOJB.epc_id = res_query.data.epc_id;
                const insert_log = await InsertData('log_rfid', logOJB, transaction);
                
                await QueryRedis.setCache(dataOJB.epc, 'ecp', res_query.data);
                console.log('✅ Insert log_rfid Successful!');
                await ActivityLogService.Insert_logAction(null, 'INSERT', 'log_rfid', insert_log.data.log_id, {
                    device_id: payload.device_id,
                    ip_address: payload.ip, 
                    mac_address: payload.mac
                }, transaction);

                return {
                    result: res_query,
                    recordId: res_query.data.epc_id, // ส่ง ID กลับไปให้ Helper ทำ Log
                    logPayload: { 
                        device_id: payload.device_id,
                        ip_address: payload.ip, 
                        mac_address: payload.mac
                    }
                };
            });
    }catch(error){
        console.error('Error occurred while checking cache or fetching data from database:', error);
    }
}

const triggerCAM = async (TopicCam: string , epc: string) => {
    const payload = JSON.stringify({epc: epc , cap: "1"})
    console.log('📩 TopicCam : ', TopicCam , ' Payload : ', payload);
    await publishMessage(TopicCam, payload);
}