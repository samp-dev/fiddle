import { Request, Response } from 'express';
import path from 'path';

import DownloadService from '../../services/download.service';
import Fiddle from '../../../common/fiddle';

export class Controller {
  async byId(req: Request, res: Response): Promise<any> {
    const fiddle: Fiddle = await DownloadService.byId(req.params.id);

    if (!fiddle)
      return res.status(404).send({ error: 'Not found' });
    
    // @ts-ignore
    res.zip({
      files: [
        { path: path.join(fiddle.getFiddleRootPath(), 'pawn.json'), name: 'pawn.json' },
        { path: path.join(fiddle.getFiddleRootPath(), 'script.pwn'), name: 'script.pwn' },
      ],
      filename: `${req.params.id}.zip`,
    });
  }
}

export default new Controller();
