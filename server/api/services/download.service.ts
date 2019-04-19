import l from '../../common/logger';
import Fiddle from '../../common/fiddle';

export class DownloadService {
  async byId(id: string): Promise<Fiddle> {
    const fiddle: Fiddle = new Fiddle();
    
    if (await fiddle.setData(id))
      return fiddle;
    else
      return null;
  }
}

export default new DownloadService();
