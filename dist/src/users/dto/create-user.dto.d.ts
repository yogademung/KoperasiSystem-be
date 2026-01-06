export declare class CreateUserDto {
    username: string;
    password: string;
    fullName: string;
    roleId?: number;
    staffId?: string;
    regionCode?: string;
    isActive?: boolean;
    isTotpEnabled?: boolean;
}
