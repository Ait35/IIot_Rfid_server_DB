import { Response , Request} from 'express';
import { sigin_service } from '../service/sigin_source.js';
import { login_service } from '../service/login_source.js';

export const Sigin_control = async (req:Request, res:Response) => {
    console.log('----- API action: user control -----');
    try {
        //กรอก data จาก wed ครบเปล่า
        const { university_id , password } = req.body;

        if(!university_id || !password){
            console.log('missing university id or password');
            return res.status(400).json({error: 'Missing university id or password'});
        }

        //เรียก service
        const sigin_res = await sigin_service(university_id, password); //return Json 

        if(!sigin_res.success){
            console.log('error in sigin service :' , sigin_res);
            console.log(`❌ Sigin failed`);
            return res.status(sigin_res.status).json(sigin_res);
        }

        console.log('✅ Sigin success');
        res.status(200).json(sigin_res);
    } catch (error) {
        console.error('error in user control');
        res.status(500).json({ error: 'error in user control' });
    } finally {
      console.log(`============================================`);
    }
};

export const Login_control = async (req:Request, res:Response) => {
    console.log('----- API action: user control -----');
    try {
        //กรอก data จาก wed ครบเปล่า
        const { university_id , password } = req.body;

        if(!university_id || !password){
            console.log('missing university id or password');
            return res.status(400).json({error: 'Missing university id or password'});
        }

        //เรียก service
        const login_res = await login_service(university_id, password); //return Json 

        if(!login_res.success){
            console.log('error in sigin service :' , login_res);
            console.log(`❌ Login failed`);
            return res.status(login_res.status).json(login_res);
        }

        console.log('✅ Login success');
        res.status(200).json(login_res);
    } catch (error) {
        console.error('error in user control');
        res.status(500).json({ error: 'error in user control' });
    } finally {
        console.log(`============================================`);
    }
};