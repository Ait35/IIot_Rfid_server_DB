import { getData } from '../../Repository/ReadQuery.js';
import { ActivityLogService } from '../../Repository/Activity_Log/ActivityQuery.js';
import { Helper } from '../Class_service.js';
import { InsertData } from '../../Repository/insertQuery.js';
import { PoolClient } from 'pg';

interface C_Log {
    device_id: number;
    epc_id?: number;
    mac : string;
    ip : string;
    distance: number;
    timestamp?: string;
}

interface C_ECP_Tag {
    epc : string;
    tag : string | null;
    status	: string;	
    is_delete? : boolean;
}

export const cache_Rfid = async (topic : string, message : string) => {
    console.log('----- Mqtt action: chack Cache -----');
    const topicParts = topic.split('/');
    const payload = JSON.parse(message);

    const dataOJB: C_ECP_Tag = {
        epc : payload.epc,
        tag : null,
        status	: "pending"
    } //เดี่ยวต้องลบออกจาก cache ตอนที่เราเรีนก updata status จะได้เอาค่าล่าสุดมาใช้

    const logOJB: C_Log = {
        device_id: payload.device_id,
        distance: payload.distance,
        ...( payload.timestamp && { timestamp: payload.timestamp } )
    }

    console.log("📩 tocpic : ", topicParts);
    console.log("📩 macIntopic : ", topicParts[5]);
    console.log("📩 payload : ", payload);
    try{
        const cache_result = await Helper.Service.ChackCacheAndSave('Rfid', dataOJB.epc, 'map_tag', 'epc');
        if(cache_result.success){
            console.log('----- Data in found in DB or cache -----');
            
            return await Helper.Service.executeWithLog('Insert log_rfid', 'log_rfid', 'INSERT', null ,
                async (transaction: PoolClient)=>{
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
        } //ถ้ามันสำเร็จ แสดงว่ามีข้อมูลใน DB มันจะ return

        console.log('----- Data not found in DB or cache -----');
        return await Helper.Service.executeWithLog('Insert map_Tag', 'map_tag', 'INSERT', null , 
            async (transaction: PoolClient)=>{
                const res_query = await InsertData('map_tag', dataOJB, transaction);
                logOJB.epc_id = res_query.data.epc_id;
                const insert_log = await InsertData('log_rfid', logOJB, transaction);
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

};