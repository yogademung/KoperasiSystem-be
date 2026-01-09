import { KreditService } from './kredit.service';
export declare class KreditController {
    private readonly kreditService;
    constructor(kreditService: KreditService);
    createApplication(user: any, data: any): Promise<any>;
    findAll(page?: string, limit?: string, status?: string): Promise<{
        data: any;
        total: any;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<any>;
    addCollateral(id: string, user: any, data: any, files: {
        photos?: Express.Multer.File[];
    }): Promise<any>;
    submitAnalysis(id: string, user: any, data: any): Promise<any>;
    approve(id: string, user: any, decision: any): Promise<any>;
    activate(id: string, user: any, data: any): Promise<any>;
    payInstallment(id: string, user: any, data: any): Promise<any>;
}
