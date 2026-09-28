import redis from '../Infra/connect_redis.js';

export const QueryRedis = {
    async setDeviceCache(api_key: string, deviceData: any) {
        console.log('----- API action: setDeviceCache  -----');
        if (!redis) {
            return { success: false, status: 500, error: 'Redis not connected' };
        }

        try {
            // สร้าง Key ให้มี Prefix ชัดเจน จะได้ไม่ไปปนกับข้อมูลอื่น
            const key = `deviceAuth:${api_key}`;
            
            // แปลง Object เป็น String ก่อนบันทึกลง Redis
            const stringData = JSON.stringify(deviceData);

            const result = await redis.set(key, stringData, {
                EX: 3600 // ]ลบออกใน 1 ชั่วโมง
            });
        
            console.log(`Saved Cache for ${api_key} -> result:`, result);
            return { success: true, status: 200, data: result };
        } catch (error) {
            console.error('Redis Set Error:', error);
            return { success: false, status: 500, error: 'Failed to set Redis' };
        }
    },

    // แปลงกลับเป็น Object
    async getDeviceCache(api_key: string) {
        console.log('----- API action: getDeviceCache  -----');
        if (!redis) {
            return { success: false, status: 500, error: 'Redis not connected' };
        }

        try {
            const key = `deviceAuth:${api_key}`;
            const resultString = await redis.get(key);

            // ถ้าระบบหาไม่เจอ (Cache Miss) มันจะ return ค่าเป็น null ออกมา
            if (!resultString) {
                console.log(`Cache Miss for ${api_key}`);
                return { success: true, status: 404, data: null };
            }

            const deviceData = JSON.parse(resultString);
            
            return { success: true, status: 200, data: deviceData };
        } catch (error) {
             console.error('Redis Get Error:', error);
             return { success: false, status: 500, error: 'Failed to get Redis' };
        }
    }
}