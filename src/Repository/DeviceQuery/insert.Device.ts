import { PoolClient } from 'pg';

 export const insertDevice = async (
        key_api : string,
        device_name : string, 
        mac : string, 
        local : string ,
        by_user_id: string,
        ip:string = "127.0.0.1",
        gateway:string = "127.0.0.1",
        subnet:string = "255.255.255.0",
        transaction: PoolClient) =>
    {
        console.log('----- API action: insert device -----'); //By_user_id จะเกะจาก token
        if(!transaction) throw new Error('ไม่มีการเชื่อมต่อกับ DB ได้');
    
        const sql = `
            INSERT INTO device_info (key_api, device_name, mac, ip, gate_way, subnet, local, by_user_id)
            VALUES ($1, $2, $3, $4, $5 , $6, $7 , $8)
            RETURNING device_name , mac , ip , gate_way , subnet , local , by_user_id;
        `;
        const values = [key_api, device_name, mac, ip, gateway, subnet, local, by_user_id];
        try{
            
            const result = await transaction.query(sql, values);

            return { success: true, status: 200, data: result.rows[0] };
        }catch(error : any){
            if(error.code === '23505'){
               throw new Error(`Device is config already try again : ` , error);
            }
            throw error;
        }
    }