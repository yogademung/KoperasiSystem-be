export declare class DenominationDto {
    denom100k?: number;
    denom50k?: number;
    denom20k?: number;
    denom10k?: number;
    denom5k?: number;
    denom2k?: number;
    denom1k?: number;
    denom500?: number;
    denom200?: number;
    denom100?: number;
}
export declare class StartShiftDto {
    denominations: DenominationDto;
}
export declare class EndShiftDto {
    denominations: DenominationDto;
}
