import { VendorService } from './vendor.service';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    create(data: any): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        name: string;
        email: string | null;
        status: string;
        code: string;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    getApAging(): Promise<any[]>;
    findAll(): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        name: string;
        email: string | null;
        status: string;
        code: string;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }[]>;
    update(id: string, data: any): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        name: string;
        email: string | null;
        status: string;
        code: string;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        createdBy: string | null;
        createdAt: Date;
        name: string;
        email: string | null;
        status: string;
        code: string;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
}
