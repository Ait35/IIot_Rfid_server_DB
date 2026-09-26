import { Router , Request , Response} from 'express';
import { db } from '../../Connect_db/connect_db.js';

const router = Router();

router.get('/iiot/options_increment/table/:nameTable', async (req: Request, res: Response) => {
    const nameTable : string = req.params.nameTable as string

    if(!db) return { success: false, status: 500, error: 'Database not connected' };
    if(!nameTable) return { success: false, status: 400, error: 'Missing nameTable' };
    //ใช้ /../ Regex $อ่านให้จบ +มีอย่างน้อย 1 ตัวอักษรขึ้นไป 
    const isValidTableName = /^[a-zA-Z0-9_]+$/.test(nameTable);
    if (!isValidTableName) {
        return res.status(500).json({ error: 'Invalid table name' });
    }
    try {
        await db.query(`TRUNCATE TABLE "${nameTable}" RESTART IDENTITY CASCADE;`);

        console.log("--- INCREMENT SUCCESS ---");
        return res.status(200).json({ massage: "INCREMENT SUCCESS"});
    }catch (error : any) {
        console.log("INCREMENT ERROR");
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;