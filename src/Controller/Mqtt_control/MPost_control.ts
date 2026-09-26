import { Response , Request} from 'express';
import{ MqttService } from '../../service/Group_service.js';

export const MPost_control = async (req:Request, res:Response) => {
    console.log('----- API action: mqtt control -----');
    const userId = (req as any).payload.user_id;
    const { topic,Config_device_id, User_Mqtt , Pass_Mqtt} = req.body;
    const ipAddress = req.ip || 'Unknown IP';
    const userAgent = req.headers['user-agent'] || 'Unknown Device';

    if(!userId){
        console.log('Missing user id');
        return res.status(400).json({error: 'Missing user id'});
    }
    if(!topic || !Config_device_id){
        console.log('Missing data');
        return res.status(400).json({error: 'Missing data'});
    }

    try {
        const mqtt_res = await MqttService.post.post_mqtt(topic , Config_device_id , userId, User_Mqtt , Pass_Mqtt , ipAddress , userAgent);
        if(!mqtt_res.success){
            console.log(mqtt_res);
            return res.status(mqtt_res.status).json(mqtt_res);
        }
        console.log('✅ Add MQTT Successful!');

    } catch (error) {
        console.error('error in mqtt control');
        res.status(500).json({ error: 'error in mqtt control' });
    }
};