import { Response , Request} from 'express';
import{ DeviceService } from '../../service/Class_service.js';

export const device_post_control = async (req:Request, res:Response) => {
    console.log('----- API action: Post Device control -----');
    const userId = (req as any).payload.user_id;
    const { device_name, mac,  type , group_id, local} = req.body; //ครั้งแรกจากหน้สเว็ปไม่สามารถ config ได้ทั้งหมด
    const ipAddress = req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';
    
    if(!userId){
        console.log('Missing user id');
        return res.status(400).json({error: 'Missing user id'});
    }
    if(!device_name || !mac || !local || !group_id || !type){
        console.log('Missing data');
        console.log(device_name, mac, local, group_id, type);
        return res.status(400).json({error: 'Missing data'});
    }

    try {
        const device_res = await DeviceService.DeviceWrite.post_device(
            device_name , mac , local , userId, group_id, type, ipAddress , userAgent
        );
        if(!device_res.success){
            console.log(device_res);
            return res.status(device_res.status).json(device_res);
        }
        console.log('✅ Add Device Successful!');
        return res.status(200).json(device_res);
    } catch (error) {
        console.error('error in mqtt control');
        res.status(500).json({ error: 'error in mqtt control' });
    }
};

// export const Mqtt_updata_control = async (req:Request, res:Response) => {
//     console.log('----- API action: updata mqtt  control -----');
//     const userId = (req as any).payload.user_id;
//     const {mqtt_id, topic,config_device_id, user_mqtt , pass_mqtt , is_delete} = req.body;
//     const ipAddress = req.ip || 'Unknown IP';
//     const userAgent = req.headers['user-agent'] || 'Unknown Device';

//     if(!userId){
//         console.log('Missing user id');
//         return res.status(400).json({error: 'Missing user id'});
//     }
//     if(!mqtt_id ){
//         console.log('Missing data');
//         return res.status(400).json({error: 'Missing data'});
//     }

//     try {
//         const device_res = await MqttService.MqttWrite.update_mqtt(mqtt_id ,topic , userId , config_device_id, user_mqtt , 
//             pass_mqtt , ipAddress , userAgent, is_delete);
//         if(!mqtt_res.success){
//             console.log(mqtt_res);
//             return res.status(mqtt_res.status).json(mqtt_res);
//         }
//         console.log('✅ Update MQTT Successful!');
//         return res.status(200).json(mqtt_res);
//     } catch (error) {
//         console.error('error in mqtt control');
//         res.status(500).json({ error: 'error in mqtt control' });
//     }
// };