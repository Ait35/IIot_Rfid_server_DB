import { insertRfidLog } from './rfid.Service.js';
import { updateStatusService } from './status.Service.js';

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

// callBack function สำหรับ mqtt ที่ถูกเรียกใช้ใน callback ของ mqtt อีกที
export const dispatch_message = async (topic : string, message : string) => {
    console.log('----- Mqtt action: dispatch_message -----');
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
  
            return await updateStatusService(payload);

        default:
            return { success: false, message: 'Invalid topic format' };
        };
    }