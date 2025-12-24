"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
const settings_service_1 = require("../settings/settings.service");
let ReportsService = class ReportsService {
    prisma;
    settingsService;
    constructor(prisma, settingsService) {
        this.prisma = prisma;
        this.settingsService = settingsService;
    }
    async getCreditApplicationData(id) {
        const credit = await this.prisma.debiturKredit.findUnique({
            where: { id },
            include: {
                nasabah: true,
                collaterals: {
                    include: { collateral: true }
                }
            }
        });
        if (!credit)
            throw new common_1.NotFoundException('Credit application not found');
        const companyProfile = await this.settingsService.getProfile();
        return {
            template: 'K01',
            companyProfile,
            noPermohonan: credit.noPermohonan,
            tanggal: credit.tglPengajuan,
            nasabah: {
                nama: credit.nasabah.nama,
                alamat: credit.nasabah.alamat,
                pekerjaan: credit.nasabah.pekerjaan,
                ktp: credit.nasabah.noKtp,
            },
            pengajuan: {
                nominal: this.normalizeCurrency(credit.nominalPengajuan),
                terbilang: this.terbilang(this.normalizeCurrency(credit.nominalPengajuan)),
                jangkaWaktu: credit.mohonJangkaWaktu,
                tujuan: credit.tujuanKredit,
                jenis: credit.jenisKredit,
            }
        };
    }
    async getCreditAgreementData(id) {
        const credit = await this.prisma.debiturKredit.findUnique({
            where: { id },
            include: {
                nasabah: true,
                collaterals: {
                    include: { collateral: true }
                },
                realisasi: true
            }
        });
        if (!credit)
            throw new common_1.NotFoundException('Credit data not found');
        const companyProfile = await this.settingsService.getProfile();
        const ketuaInfo = await this.prisma.lovValue.findFirst({
            where: { code: 'TTD_REPORT', codeValue: 'KETUA' }
        });
        return {
            template: 'SPK',
            companyProfile,
            nomorSpk: credit.nomorKredit || 'DRAFT',
            tanggalAkad: credit.realisasi[0]?.tglRealisasi || new Date(),
            pihakPertama: {
                nama: ketuaInfo?.description || 'Ketua Koperasi',
                jabatan: 'Ketua Pengurus'
            },
            pihakKedua: {
                nama: credit.nasabah.nama,
                alamat: credit.nasabah.alamat,
                ktp: credit.nasabah.noKtp
            },
            pinjaman: {
                nominal: this.normalizeCurrency(credit.nominalPengajuan),
                terbilang: this.terbilang(this.normalizeCurrency(credit.nominalPengajuan)),
                bungaPct: credit.mohonSukuBunga,
                jangkaWaktu: credit.mohonJangkaWaktu,
                angsuranPokok: this.normalizeCurrency(credit.nominalPengajuan) / Number(credit.mohonJangkaWaktu),
            },
            jaminan: credit.collaterals.map(AG => ({
                jenis: AG.collateral.type,
                keterangan: AG.collateral.description,
                nilai: this.normalizeCurrency(AG.collateral.assessedValue)
            }))
        };
    }
    async getCreditStatementData(id) {
        const credit = await this.prisma.debiturKredit.findUnique({
            where: { id },
            include: {
                nasabah: true,
                jadwal: {
                    orderBy: { angsuranKe: 'asc' }
                },
                transactions: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        if (!credit)
            throw new common_1.NotFoundException('Credit data not found');
        const companyProfile = await this.settingsService.getProfile();
        return {
            template: 'K04',
            companyProfile,
            header: {
                noRekening: credit.nomorKredit,
                nama: credit.nasabah.nama,
                alamat: credit.nasabah.alamat,
                plafon: this.normalizeCurrency(credit.nominalPengajuan),
                jangkaWaktu: credit.mohonJangkaWaktu,
                bungaPct: credit.mohonSukuBunga,
            },
            jadwal: credit.jadwal.map(j => ({
                ...j,
                angsuranPokok: this.normalizeCurrency(j.pokok),
                angsuranBunga: this.normalizeCurrency(j.bunga),
                totalAngsuran: this.normalizeCurrency(j.total),
                sisaPinjaman: this.normalizeCurrency(j.sisaPokok)
            })),
            transaksi: credit.transactions.map(t => ({ ...t, nominal: this.normalizeCurrency(t.nominal) }))
        };
    }
    async getSavingsPassbookData(type, accountNumber) {
        const companyProfile = await this.settingsService.getProfile();
        let accountData = null;
        let transactions = [];
        let title = '';
        if (type === 'TABUNGAN') {
            const acc = await this.prisma.nasabahTab.findUnique({
                where: { noTab: accountNumber },
                include: { nasabah: true, transactions: { orderBy: { createdAt: 'asc' } } }
            });
            if (!acc)
                throw new common_1.NotFoundException('Account not found');
            accountData = acc;
            transactions = acc.transactions;
            title = 'TABUNGAN RELA';
        }
        else if (type === 'BRAHMACARI') {
            const acc = await this.prisma.nasabahBrahmacari.findUnique({
                where: { noBrahmacari: accountNumber },
                include: { nasabah: true, transactions: { orderBy: { createdAt: 'asc' } } }
            });
            if (!acc)
                throw new common_1.NotFoundException('Account not found');
            accountData = acc;
            transactions = acc.transactions;
            title = 'TABUNGAN BRAHMACARI';
        }
        else if (type === 'BALIMESARI') {
            const acc = await this.prisma.nasabahBalimesari.findUnique({
                where: { noBalimesari: accountNumber },
                include: { nasabah: true, transactions: { orderBy: { createdAt: 'asc' } } }
            });
            if (!acc)
                throw new common_1.NotFoundException('Account not found');
            accountData = acc;
            transactions = acc.transactions;
            title = 'TABUNGAN BALIMESARI';
        }
        else if (type === 'WANAPRASTA') {
            const acc = await this.prisma.nasabahWanaprasta.findUnique({
                where: { noWanaprasta: accountNumber },
                include: { nasabah: true, transactions: { orderBy: { createdAt: 'asc' } } }
            });
            if (!acc)
                throw new common_1.NotFoundException('Account not found');
            accountData = acc;
            transactions = acc.transactions;
            title = 'TABUNGAN WANAPRASTA';
        }
        else if (type === 'ANGGOTA') {
            const acc = await this.prisma.anggotaAccount.findUnique({
                where: { accountNumber },
                include: { customer: true, transactions: { orderBy: { transDate: 'asc' } } }
            });
            if (!acc)
                throw new common_1.NotFoundException('Account not found');
            accountData = {
                nasabah: acc.customer,
                tglBuka: acc.openDate,
                ...acc
            };
            transactions = acc.transactions.map(t => ({
                ...t,
                createdAt: t.transDate,
                tipeTrans: t.transType,
                saldoAkhir: t.balanceAfter,
                keterangan: t.description,
                nominal: t.amount
            }));
            title = 'SIMPANAN ANGGOTA';
        }
        else {
            throw new common_1.BadRequestException('Invalid savings type');
        }
        const normalizedTransactions = transactions.map(t => ({
            date: t.createdAt,
            code: t.tipeTrans,
            debit: t.tipeTrans.includes('TARIK') || t.tipeTrans.includes('DEBIT') ? Math.abs(this.normalizeCurrency(t.nominal)) : 0,
            credit: t.tipeTrans.includes('SETOR') || t.tipeTrans.includes('CREDIT') || t.tipeTrans.includes('BUNGA') ? Math.abs(this.normalizeCurrency(t.nominal)) : 0,
            balance: this.normalizeCurrency(t.saldoAkhir),
            description: t.keterangan
        }));
        return {
            template: 'PASSBOOK',
            title: title,
            companyProfile,
            header: {
                noRekening: accountNumber,
                nama: accountData.nasabah.nama,
                alamat: accountData.nasabah.alamat,
                id: accountData.nasabah.id,
                tglBuka: accountData.tglBuka
            },
            data: normalizedTransactions
        };
    }
    async getDepositoCertificateData(noJangka) {
        const deposito = await this.prisma.nasabahJangka.findUnique({
            where: { noJangka },
            include: { nasabah: true }
        });
        if (!deposito)
            throw new common_1.NotFoundException('Deposito not found');
        const companyProfile = await this.settingsService.getProfile();
        return {
            template: 'D02',
            companyProfile,
            nomorBilyet: deposito.noJangka,
            nasabah: {
                nama: deposito.nasabah.nama,
                alamat: deposito.nasabah.alamat,
                id: deposito.nasabahId
            },
            detail: {
                nominal: this.normalizeCurrency(deposito.nominal),
                terbilang: this.terbilang(this.normalizeCurrency(deposito.nominal)),
                jangkaWaktu: 'X Bulan',
                bungaPct: deposito.bunga,
                tglMulai: deposito.tglBuka,
                tglJatuhTempo: deposito.tglJatuhTempo,
                perpanjanganOtomatis: deposito.payoutMode === 'ROLLOVER' ? 'YA (Kapitalisasi Bunga)' :
                    deposito.payoutMode === 'TRANSFER' ? `YA (Bunga Masuk Tabungan: ${deposito.targetAccountId || '-'})` : 'TIDAK'
            },
            account: {
                noRekening: deposito.noJangka,
                nominal: this.normalizeCurrency(deposito.nominal),
                terbilang: this.terbilang(this.normalizeCurrency(deposito.nominal)),
                jangkaWaktu: 'X',
                jatuhTempo: deposito.tglJatuhTempo,
                bunga: deposito.bunga,
                tglBuka: deposito.tglBuka,
                perpanjanganOtomatis: deposito.payoutMode === 'ROLLOVER' ? 'YA (Kapitalisasi Bunga)' :
                    deposito.payoutMode === 'TRANSFER' ? `YA (Bunga Masuk Tabungan: ${deposito.targetAccountId || '-'})` : 'TIDAK'
            }
        };
    }
    async getAnggotaRegistrationData(accountNumber) {
        const account = await this.prisma.anggotaAccount.findUnique({
            where: { accountNumber },
            include: { customer: true }
        });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        const companyProfile = await this.settingsService.getProfile();
        return {
            template: 'FORM_ANGGOTA',
            companyProfile,
            account: {
                noRekening: account.accountNumber,
                tglBuka: account.openDate,
                principal: this.normalizeCurrency(account.principal),
                mandatory: this.normalizeCurrency(account.mandatoryInit),
                terbilangPokok: this.terbilang(this.normalizeCurrency(account.principal)),
                terbilangWajib: this.terbilang(this.normalizeCurrency(account.mandatoryInit))
            },
            nasabah: {
                nama: account.customer.nama,
                id: account.customer.id,
                ktp: account.customer.noKtp,
                alamat: account.customer.alamat,
                pekerjaan: account.customer.pekerjaan,
                phone: account.customer.telepon
            }
        };
    }
    async getAnggotaClosureData(accountNumber) {
        const account = await this.prisma.anggotaAccount.findUnique({
            where: { accountNumber },
            include: {
                customer: true,
                transactions: {
                    where: {
                        transType: { in: ['TUTUP', 'DENDA', 'BIAYA_ADMIN'] }
                    },
                    orderBy: { transDate: 'desc' },
                    take: 10
                }
            }
        });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        const companyProfile = await this.settingsService.getProfile();
        const closureTx = account.transactions.find(t => t.transType === 'TUTUP');
        const penaltyTx = account.transactions.find(t => t.transType === 'DENDA');
        const adminTx = account.transactions.find(t => t.transType === 'BIAYA_ADMIN');
        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;
        if (closureTx) {
            refundAmount = Math.abs(this.normalizeCurrency(closureTx.amount));
            penaltyAmount = penaltyTx ? Math.abs(this.normalizeCurrency(penaltyTx.amount)) : 0;
            adminAmount = adminTx ? Math.abs(this.normalizeCurrency(adminTx.amount)) : 0;
            closeBalance = refundAmount + penaltyAmount + adminAmount;
        }
        else {
            closeBalance = this.normalizeCurrency(account.balance);
            refundAmount = closeBalance;
        }
        return {
            template: 'FORM_TUTUP_ANGGOTA',
            companyProfile,
            account: {
                noRekening: account.accountNumber,
                tglBuka: account.openDate,
                tglTutup: account.closeDate || new Date(),
                closeBalance: closeBalance,
                penalty: penaltyAmount,
                adminFee: adminAmount,
                refund: refundAmount,
                terbilangRefund: this.terbilang(refundAmount)
            },
            nasabah: {
                nama: account.customer.nama,
                id: account.customer.id,
                ktp: account.customer.noKtp,
                alamat: account.customer.alamat,
                phone: account.customer.telepon
            }
        };
    }
    async getTabrelaClosureData(noTab) {
        const account = await this.prisma.nasabahTab.findUnique({
            where: { noTab },
            include: {
                nasabah: true,
                transactions: {
                    where: {
                        tipeTrans: { in: ['TUTUP', 'DENDA', 'BIAYA_ADMIN'] }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        const companyProfile = await this.settingsService.getProfile();
        const closureTx = account.transactions.find(t => t.tipeTrans === 'TUTUP');
        const penaltyTx = account.transactions.find(t => t.tipeTrans === 'DENDA');
        const adminTx = account.transactions.find(t => t.tipeTrans === 'BIAYA_ADMIN');
        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;
        if (closureTx) {
            refundAmount = Math.abs(Number(closureTx.nominal));
            penaltyAmount = penaltyTx ? Math.abs(Number(penaltyTx.nominal)) : 0;
            adminAmount = adminTx ? Math.abs(Number(adminTx.nominal)) : 0;
            closeBalance = refundAmount + penaltyAmount + adminAmount;
        }
        else {
            closeBalance = Number(account.saldo);
            refundAmount = closeBalance;
        }
        return {
            template: 'FORM_TUTUP_TABRELA',
            companyProfile,
            account: {
                noRekening: account.noTab,
                tglBuka: account.tglBuka,
                tglTutup: new Date(),
                closeBalance: closeBalance,
                penalty: penaltyAmount,
                adminFee: adminAmount,
                refund: refundAmount,
                terbilangRefund: this.terbilang(refundAmount)
            },
            nasabah: account.nasabah
        };
    }
    async getBrahmacariClosureData(noBrahmacari) {
        const account = await this.prisma.nasabahBrahmacari.findUnique({
            where: { noBrahmacari },
            include: {
                nasabah: true,
                transactions: {
                    where: {
                        tipeTrans: { in: ['TUTUP', 'DENDA', 'BIAYA_ADMIN'] }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        const companyProfile = await this.settingsService.getProfile();
        const closureTx = account.transactions.find(t => t.tipeTrans === 'TUTUP');
        const penaltyTx = account.transactions.find(t => t.tipeTrans === 'DENDA');
        const adminTx = account.transactions.find(t => t.tipeTrans === 'BIAYA_ADMIN');
        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;
        if (closureTx) {
            refundAmount = Math.abs(Number(closureTx.nominal));
            penaltyAmount = penaltyTx ? Math.abs(Number(penaltyTx.nominal)) : 0;
            adminAmount = adminTx ? Math.abs(Number(adminTx.nominal)) : 0;
            closeBalance = refundAmount + penaltyAmount + adminAmount;
        }
        else {
            closeBalance = Number(account.saldo);
            refundAmount = closeBalance;
        }
        return {
            template: 'FORM_TUTUP_BRAHMACARI',
            companyProfile,
            account: {
                noRekening: account.noBrahmacari,
                tglBuka: account.tglBuka,
                tglTutup: new Date(),
                closeBalance: closeBalance,
                penalty: penaltyAmount,
                adminFee: adminAmount,
                refund: refundAmount,
                terbilangRefund: this.terbilang(refundAmount)
            },
            nasabah: account.nasabah
        };
    }
    async getBalimesariClosureData(noBalimesari) {
        const account = await this.prisma.nasabahBalimesari.findUnique({
            where: { noBalimesari },
            include: {
                nasabah: true,
                transactions: {
                    where: {
                        tipeTrans: { in: ['TUTUP', 'DENDA', 'BIAYA_ADMIN'] }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        const companyProfile = await this.settingsService.getProfile();
        const closureTx = account.transactions.find(t => t.tipeTrans === 'TUTUP');
        const penaltyTx = account.transactions.find(t => t.tipeTrans === 'DENDA');
        const adminTx = account.transactions.find(t => t.tipeTrans === 'BIAYA_ADMIN');
        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;
        if (closureTx) {
            refundAmount = Math.abs(Number(closureTx.nominal));
            penaltyAmount = penaltyTx ? Math.abs(Number(penaltyTx.nominal)) : 0;
            adminAmount = adminTx ? Math.abs(Number(adminTx.nominal)) : 0;
            closeBalance = refundAmount + penaltyAmount + adminAmount;
        }
        else {
            closeBalance = Number(account.saldo);
            refundAmount = closeBalance;
        }
        return {
            template: 'FORM_TUTUP_BALIMESARI',
            companyProfile,
            account: {
                noRekening: account.noBalimesari,
                tglBuka: account.tglBuka,
                tglTutup: new Date(),
                closeBalance: closeBalance,
                penalty: penaltyAmount,
                adminFee: adminAmount,
                refund: refundAmount,
                terbilangRefund: this.terbilang(refundAmount)
            },
            nasabah: account.nasabah
        };
    }
    async getWanaprastaClosureData(noWanaprasta) {
        const account = await this.prisma.nasabahWanaprasta.findUnique({
            where: { noWanaprasta },
            include: {
                nasabah: true,
                transactions: {
                    where: {
                        tipeTrans: { in: ['TUTUP', 'DENDA', 'BIAYA_ADMIN'] }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        const companyProfile = await this.settingsService.getProfile();
        const closureTx = account.transactions.find(t => t.tipeTrans === 'TUTUP');
        const penaltyTx = account.transactions.find(t => t.tipeTrans === 'DENDA');
        const adminTx = account.transactions.find(t => t.tipeTrans === 'BIAYA_ADMIN');
        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;
        if (closureTx) {
            refundAmount = Math.abs(Number(closureTx.nominal));
            penaltyAmount = penaltyTx ? Math.abs(Number(penaltyTx.nominal)) : 0;
            adminAmount = adminTx ? Math.abs(Number(adminTx.nominal)) : 0;
            closeBalance = refundAmount + penaltyAmount + adminAmount;
        }
        else {
            closeBalance = Number(account.saldo);
            refundAmount = closeBalance;
        }
        return {
            template: 'FORM_TUTUP_WANAPRASTA',
            companyProfile,
            account: {
                noRekening: account.noWanaprasta,
                tglBuka: account.tglBuka,
                tglTutup: new Date(),
                closeBalance: closeBalance,
                penalty: penaltyAmount,
                adminFee: adminAmount,
                refund: refundAmount,
                terbilangRefund: this.terbilang(refundAmount)
            },
            nasabah: account.nasabah
        };
    }
    async getDepositoClosureData(noJangka) {
        const account = await this.prisma.nasabahJangka.findUnique({
            where: { noJangka },
            include: {
                nasabah: true,
                transactions: {
                    where: {
                        tipeTrans: { in: ['CAIR', 'DENDA', 'BIAYA_ADMIN'] }
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });
        if (!account)
            throw new common_1.NotFoundException('Account not found');
        const companyProfile = await this.settingsService.getProfile();
        const closureTx = account.transactions.find(t => t.tipeTrans === 'CAIR');
        const penaltyTx = account.transactions.find(t => t.tipeTrans === 'DENDA');
        const adminTx = account.transactions.find(t => t.tipeTrans === 'BIAYA_ADMIN');
        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;
        const principal = this.normalizeCurrency(account.nominal);
        if (closureTx) {
            penaltyAmount = penaltyTx ? Math.abs(this.normalizeCurrency(penaltyTx.nominal)) : 0;
            adminAmount = adminTx ? Math.abs(this.normalizeCurrency(adminTx.nominal)) : 0;
            closeBalance = principal;
            refundAmount = closeBalance - penaltyAmount - adminAmount;
        }
        else {
            closeBalance = principal;
            refundAmount = closeBalance;
        }
        return {
            template: 'FORM_TUTUP_DEPOSITO',
            companyProfile,
            account: {
                noRekening: account.noJangka,
                tglBuka: account.tglBuka,
                tglTutup: new Date(),
                tglJatuhTempo: account.tglJatuhTempo,
                closeBalance: closeBalance,
                penalty: penaltyAmount,
                adminFee: adminAmount,
                refund: refundAmount,
                terbilangRefund: this.terbilang(refundAmount)
            },
            nasabah: account.nasabah
        };
    }
    normalizeCurrency(value) {
        return Number(value || 0) * 1000;
    }
    getTerbilangWords(nominal) {
        const bil = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
        let terbilang = "";
        if (nominal < 12) {
            terbilang = " " + bil[nominal];
        }
        else if (nominal < 20) {
            terbilang = this.getTerbilangWords(nominal - 10) + " Belas";
        }
        else if (nominal < 100) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 10)) + " Puluh" + this.getTerbilangWords(nominal % 10);
        }
        else if (nominal < 200) {
            terbilang = " Seratus" + this.getTerbilangWords(nominal - 100);
        }
        else if (nominal < 1000) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 100)) + " Ratus" + this.getTerbilangWords(nominal % 100);
        }
        else if (nominal < 2000) {
            terbilang = " Seribu" + this.getTerbilangWords(nominal - 1000);
        }
        else if (nominal < 1000000) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 1000)) + " Ribu" + this.getTerbilangWords(nominal % 1000);
        }
        else if (nominal < 1000000000) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 1000000)) + " Juta" + this.getTerbilangWords(nominal % 1000000);
        }
        else if (nominal < 1000000000000) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 1000000000)) + " Milyar" + this.getTerbilangWords(nominal % 1000000000);
        }
        else if (nominal < 1000000000000000) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 1000000000000)) + " Triliun" + this.getTerbilangWords(nominal % 1000000000000);
        }
        return terbilang;
    }
    terbilang(nominal) {
        return this.getTerbilangWords(nominal).trim() + " Rupiah";
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        settings_service_1.SettingsService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map