import { Response , Request} from 'express';

export const req_ConnectControl = async (req:Request, res:Response) => { //ส่งจาก esp32
    console.log('----- API action: req_ConnectControl -----');
    const { mac, ip , gate_way, subnet ,timestart,up_time } = req.body; //ฝัง mac / id ไว้ tonken
    const divice_Id = (req as any).payload.user_id; //เกะออกมาจาก tokken แล้วในฟังชั่น auth แล้ว
}