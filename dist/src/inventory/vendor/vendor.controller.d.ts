import { VendorService } from './vendor.service';
export declare class VendorController {
    private readonly vendorService;
    constructor(vendorService: VendorService);
    create(data: any): Promise<{
        id: number;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        status: string;
        email: string | null;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    getApAging(): Promise<any[]>;
    findAll(): Promise<{
        id: number;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        status: string;
        email: string | null;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }[]>;
    update(id: string, data: any): Promise<{
        id: number;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        status: string;
        email: string | null;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        name: string;
        createdBy: string | null;
        createdAt: Date;
        code: string;
        status: string;
        email: string | null;
        address: string | null;
        phone: string | null;
        contactName: string | null;
    }>;
}
