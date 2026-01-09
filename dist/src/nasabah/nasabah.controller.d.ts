import { NasabahService } from './nasabah.service';
import { CreateNasabahDto } from './dto/create-nasabah.dto';
import { UpdateNasabahDto } from './dto/update-nasabah.dto';
export declare class NasabahController {
    private readonly nasabahService;
    constructor(nasabahService: NasabahService);
    private processAndSaveFile;
    create(files: {
        fileKtp?: Express.Multer.File[];
        fileKk?: Express.Multer.File[];
    }, createNasabahDto: CreateNasabahDto): Promise<any>;
    findAll(): Promise<any>;
    searchNasabah(query: string, savingsType?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    getPortfolio(id: string): Promise<any>;
    update(id: string, updateNasabahDto: UpdateNasabahDto, files: {
        fileKtp?: Express.Multer.File[];
        fileKk?: Express.Multer.File[];
    }): Promise<any>;
    remove(id: string): Promise<any>;
}
