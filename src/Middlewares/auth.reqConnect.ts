import { Request, Response } from 'express';
import {Helper} from '../service/Class_service.js';
import { getData } from '../Repository/ReadQuery.js';

export const Auth_reqConnect = async (req: Request, res: Response) => {
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
        //prefix : string, cacheKey : string, DBtable : string , DBcolumn : string
        const cache_result = await Helper.Service.ChackCacheAndSave('deviceAuth', api_key, 'Device_info', 'key_api',
            async (data : any)=>{
                return await getData('mqtt', 'group_id', data.group_id, true);
            });

        if(!cache_result.success){
            console.log(cache_result.error );
            return res.status(cache_result.status).json({ message:'Unauthorized' });
        }
        return res.status(200).json({ message: 'ok', data: cache_result.data});
    } catch (error) {
        console.error('Middleware Auth Error:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};