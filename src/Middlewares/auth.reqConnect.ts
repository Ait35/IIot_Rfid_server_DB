import { Request, Response } from 'express';
import {Helper} from '../service/Class_service.js';
import { getData } from '../Repository/ReadQuery.js';

export const Auth_reqConnect = async (req: Request, res: Response) => {
    console.log('----- API action: authMiddleware -----');
    let api_key  = req.headers.authorization;
    let { mac } = req.body;

    console.log('mac :', mac);
    if (!mac) {
        return res.status(401).json({ message: 'Unauthorized: ไม่พบ MAC' });
    }
    if (!api_key) {
        return res.status(401).json({ message: 'Unauthorized: ไม่พบ API Key' });
    }
    if (api_key.startsWith('Bearer ')) {
        api_key = api_key.split(' ')[1] as string;
    }
    console.log('API Key :', api_key);

    try {
        //prefix : string, cacheKey : string, DBtable : string , DBcolumn : string
        const result = await Helper.Service.readAndWriteLog('ReqConnect' , 'Device_info' , null ,
             async ()=>  {
                const device_data = await getData('device_info', 'key_api', api_key, true);
                const mqttdata = await getData('mqtt', 'group_id', device_data.data.group_id, true);

                const payload =  { ...mqttdata.data, device_id : device_data.data.device_id , mac : device_data.data.mac };
                return { 
                    result: payload,
                    logPayload: payload,
                };
            });

        if(!result.success){
            console.log(result.error );
            return res.status(result.status).json({ message:'Unauthorized' });
        }

        if((result as any).data.mac !== mac){
            console.log('Key Api not match to device mac');
            return res.status(401).json({ message: 'Unauthorized: Key Api not match to device' });
        }
        console.log("device id :" + (result as any).data.device_id + " mac :" + (result as any).data.mac);
        console.log("topic :" + (result as any).data.topic);
        console.log("✅ connect success");
        return res.status(200).json({...result});
    } catch (error) {

        console.error('Middleware Auth Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }finally{
        console.log("====================================================");
    }
};