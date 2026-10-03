import { ActivityLogService } from '../../Repository/Activity_Log/ActivityQuery.js';
import { Helper } from '../Class_service.js';
import { InsertData } from '../../Repository/insertQuery.js';
import { PoolClient } from 'pg';
import { publishMessage } from '../../Infra/Mqtt.infra.js';
import { QueryRedis } from '../../Infra/Redis/cache.js';
import { updateData } from '../../Repository/updataQuery.js';

interface C_Log {
    device_id: number;
    epc_id?: number;
    mac : string;
    ip : string;
    distance: number;
    timestamp?: string;
}
interface C_Status {
    up_time : string;
    status? : boolean;
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
    console.log("📩 payload : ", payload);

    if(topicParts[0] !== 'SPU'){ 
        console.log('Invalid topic format 0');
        return{ success: false, message: 'Invalid topic format' };
    }
    if(topicParts[1] !== 'rfid' && topicParts[1] !== 'status'){
        console.log('Invalid topic format 1');
        return{ success: false, message: 'Invalid topic format' };
    }

    switch(topicParts[1]){
        case 'rfid':
            const TopicCam = `${process.env.MQTT_TOPIC_PUBLISH}/group${payload.group_id}/${topicParts[3]}/${topicParts[4]}/${topicParts[5]}/${topicParts[6]}`;
            return await insertRfidLog(payload, dataOJB, logOJB , TopicCam);1

        case 'status':
            const statusDevice : C_Status = {
                up_time : payload.up_time,
                ...(payload.status !== undefined && { status : payload.status })
            }
            return await Helper.Service.executeWithLog(
            'update_device service', 'device_info', 'UPDATE',null,
                async (transaction) => {
                    const result = await updateData('device_info', 'device_id', payload.device_id, statusDevice, transaction);
                    return { 
                        result, 
                        recordId:  payload.device_id , 
                        logPayload : { ...statusDevice, ip_address : result.data.ip, mac_address: result.data.mac} 
                    };
                }
            )
            default:
                return { success: false, message: 'Invalid topic format' };
        };
    }

const insertRfidLog = async ( payload: any, dataOJB: C_ECP_Tag ,logOJB : C_Log, TopicCam: string ) => {
        try{

        const cache_result = await Helper.Service.ChackCacheAndSave('epc', dataOJB.epc, 'map_tag', 'epc');
        if(cache_result.success){
            console.log('----- Data in found in DB or cache go triggerCAM -----');
            await triggerCAM(TopicCam , dataOJB.epc);
            
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
    const payload = JSON.stringify({epc , cap: "1"})
    console.log('📩 TopicCam : ', TopicCam , ' Payload : ', payload);
    await publishMessage(TopicCam, payload);
}