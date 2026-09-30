import { Request, Response, NextFunction } from 'express';
import { QueryRedis } from '../Infra/Redis/cache.js';
import { getData } from '../Repository/ReadQuery.js';

export const Auth_reqConnect = async (req: Request, res: Response, next: NextFunction) => {
    console.log('----- API action: authMiddleware -----');
    let api_key  = req.headers.authorization;

    if (!api_key) {
        return res.status(401).json({ message: 'Unauthorized: ไม่พบ API Key' });
    }
    if (api_key.startsWith('Bearer ')) {
        api_key = api_key.split(' ')[1] as string;
    }
    console.log('API Key :', api_key);

    try {
        const cache_result = await QueryRedis.getDeviceCache(api_key);

        if (cache_result.success && cache_result.status === 200) {
            console.log('----- Cache Hit! ข้ามการค้น Database -----');
            console.log(cache_result.data);
            (req as any).deviceConfig = cache_result.data; 
            return res.status(200).json(cache_result.data);
        }

        if (cache_result.status === 404) {
            console.log('----- Cache Miss: Call to Database -----');
            const db_data : any = await getData('Device_info', 'key_api', api_key, true);

            if (!db_data.success && db_data.status === 404) {
                console.log('Failed: API Key not found in DB');
                return res.status(401).json({ message: 'Unauthorized: API Key ไม่ถูกต้อง' });
            }

            if (!db_data.success && db_data.status === 500) {
                return res.status(500).json({ message: 'Database error' });
            }
            const mqtt_data = await getData('Mqtt', 'group_id', db_data.data.group_id, true);
    
            if(!mqtt_data.success && mqtt_data.status === 404){
                console.log('🔧  Device is not have config Mqtt');
                return res.status(200).json({ message: 'Device is not have config Mqtt' });
            }
            await QueryRedis.setDeviceCache(api_key, mqtt_data.data);
            
            // (req as any).deviceConfig = mqtt_data.data;
            return res.status(200).json(mqtt_data.data);
        }
        
    } catch (error) {
        console.error('Middleware Auth Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};