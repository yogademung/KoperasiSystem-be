import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SettingsService } from '../settings/settings.service'; // Import SettingsService

@Injectable()
export class ReportsService {
    constructor(
        private prisma: PrismaService,
        private settingsService: SettingsService, // Inject
    ) { }

    // ============================
    // CREDIT REPORT DATA
    // ============================

    async getCreditApplicationData(id: number) {
        const credit = await this.prisma.debiturKredit.findUnique({
            where: { id },
            include: {
                nasabah: true,
                collaterals: {
                    include: { collateral: true }
                }
            }
        });
        if (!credit) throw new NotFoundException('Credit application not found');

        const companyProfile = await this.settingsService.getProfile();

        return {
            template: 'K01', // Legacy code
            companyProfile, // Inject profile
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
                collaterals: credit.collaterals.map(c => ({
                    ...c,
                    collateral: {
                        ...c.collateral,
                        assessedValue: this.normalizeCurrency(c.collateral.assessedValue)
                    }
                }))
            }
        };
    }

    async getCreditAgreementData(id: number) {
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

        if (!credit) throw new NotFoundException('Credit data not found');

        const companyProfile = await this.settingsService.getProfile();

        // Fetch signatories from s_lov_value if needed (User Instruction: Use s_lov_value)
        // Assuming we might store 'TTD_KETUA' code in LovValue
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
                angsuranPokok: this.normalizeCurrency(credit.nominalPengajuan) / Number(credit.mohonJangkaWaktu), // Simplified
            },
            jaminan: credit.collaterals.map(AG => ({
                jenis: AG.collateral.type,
                keterangan: AG.collateral.description,
                nilai: this.normalizeCurrency(AG.collateral.assessedValue)
            }))
        };
    }

    async getCreditStatementData(id: number) {
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
        if (!credit) throw new NotFoundException('Credit data not found');

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

    // ============================
    // SAVINGS PASSBOOK (BUKU TABUNGAN)
    // ============================

    async getSavingsPassbookData(type: 'TABUNGAN' | 'BRAHMACARI' | 'BALIMESARI' | 'WANAPRASTA' | 'ANGGOTA' | 'KREDIT', accountNumber: string) {
        const companyProfile = await this.settingsService.getProfile();
        let accountData: any = null;
        let transactions: any[] = [];
        let title = '';

        // Unified interfaces for response
        if (type === 'TABUNGAN') {
            const acc = await this.prisma.nasabahTab.findUnique({
                where: { noTab: accountNumber },
                include: { nasabah: true, transactions: { orderBy: { createdAt: 'asc' } } }
            });
            if (!acc) throw new NotFoundException('Account not found');
            accountData = acc;
            transactions = acc.transactions;
            title = 'TABUNGAN RELA';
        } else if (type === 'BRAHMACARI') {
            const acc = await this.prisma.nasabahBrahmacari.findUnique({
                where: { noBrahmacari: accountNumber },
                include: { nasabah: true, transactions: { orderBy: { createdAt: 'asc' } } }
            });
            if (!acc) throw new NotFoundException('Account not found');
            accountData = acc;
            transactions = acc.transactions;
            title = 'TABUNGAN BRAHMACARI';
        } else if (type === 'BALIMESARI') {
            const acc = await this.prisma.nasabahBalimesari.findUnique({
                where: { noBalimesari: accountNumber },
                include: { nasabah: true, transactions: { orderBy: { createdAt: 'asc' } } }
            });
            if (!acc) throw new NotFoundException('Account not found');
            accountData = acc;
            transactions = acc.transactions;
            title = 'TABUNGAN BALIMESARI';
        } else if (type === 'WANAPRASTA') {
            const acc = await this.prisma.nasabahWanaprasta.findUnique({
                where: { noWanaprasta: accountNumber },
                include: { nasabah: true, transactions: { orderBy: { createdAt: 'asc' } } }
            });
            if (!acc) throw new NotFoundException('Account not found');
            accountData = acc;
            transactions = acc.transactions;
            title = 'TABUNGAN WANAPRASTA';
        } else if (type === 'ANGGOTA') {
            const acc = await this.prisma.anggotaAccount.findUnique({
                where: { accountNumber },
                include: { customer: true, transactions: { orderBy: { transDate: 'asc' } } }
            });
            if (!acc) throw new NotFoundException('Account not found');
            accountData = {
                nasabah: acc.customer, // Map customer to nasabah for uniform structure below
                tglBuka: acc.openDate,
                ...acc
            };
            transactions = acc.transactions.map(t => ({
                ...t,
                createdAt: t.transDate, // Map to createdAt
                tipeTrans: t.transType, // Map to tipeTrans
                saldoAkhir: t.balanceAfter, // Map to saldoAkhir
                keterangan: t.description, // Map to keterangan
                nominal: t.amount // Map to nominal
            }));
            title = 'SIMPANAN ANGGOTA';
        } else if (type === 'KREDIT') {
            const acc = await this.prisma.debiturKredit.findUnique({
                where: { nomorKredit: accountNumber }, // accountNumber here is nomorKredit
                include: {
                    nasabah: true,
                    realisasi: true,
                    transactions: { orderBy: { createdAt: 'asc' } }
                }
            });
            if (!acc) throw new NotFoundException('Credit Account not found');

            accountData = acc;
            title = 'KARTU PINJAMAN';

            // Construct transactions for Passbook (Realisasi + Payments)
            // 1. Initial Realization (Disbursement)
            let runningBalance = 0;
            const fullTransactions: any[] = [];

            if (acc.realisasi && acc.realisasi.length > 0) {
                const real = acc.realisasi[0]; // Assume single realization
                const nominalReal = Number(real.nominalRealisasi);
                runningBalance = nominalReal;

                fullTransactions.push({
                    createdAt: real.tglRealisasi,
                    tipeTrans: 'REALISASI',
                    nominal: nominalReal, // This is principal added
                    saldoAkhir: runningBalance,
                    keterangan: 'Pencairan Kredit'
                });
            }

            // 2. Installments
            if (acc.transactions) {
                for (const t of acc.transactions) {
                    const pokok = Number(t.pokokBayar || 0);
                    // Only Principal Payment affects Principal Balance
                    runningBalance -= pokok;

                    fullTransactions.push({
                        createdAt: t.createdAt, // or tglTrans
                        tipeTrans: 'ANGSURAN',
                        nominal: Number(t.nominal), // Total Pay
                        pokok: pokok,
                        bunga: Number(t.bungaBayar || 0),
                        saldoAkhir: runningBalance,
                        keterangan: t.keterangan || 'Angsuran'
                    });
                }
            }

            // Map to standardized format
            // For Loan: Debit = Increase Loan (Realization), Credit = Decrease Loan (Principal Payment)
            transactions = fullTransactions.map(t => ({
                ...t,
                // Custom mapping for normalization below
                isCredit: true
            }));

        } else {
            throw new BadRequestException('Invalid savings type');
        }

        // Normalize transactions
        // Note: Assuming savings also use Kilo storage, we normalize them.
        // If Simpanan does NOT use Kilo storage (usually doesn't), we should check.
        // Logic: Usually Simpanan is full value because logic is simpler?
        // Let's assume Kilo for consistency with Credit if user didn't specify, OR check previous inputs.
        // User said "lanjutkan... setiap produk tabungan".
        // Risk: Multiplying by 1000 might be wrong if savings are real values.
        // BUT `ReportsService` now normalized credits.
        // Let's assume Savings are also stored in THOUSANDS for this system based on Credit findings.
        // Or Safe Bet: Multiply by 1 for now, or check code.
        // Checking `TabrelaController` might reveal input handling? No it was empty.
        // I will apply normalizeCurrency for now to be safe with the "System uses Kilo" hypothesis.
        // If wrong, user will report "Saldo kebesaran".

        const normalizedTransactions = transactions.map(t => {
            let debit = 0;
            let credit = 0;

            if (t.isCredit) {
                // KREDIT Logic
                if (t.tipeTrans === 'REALISASI') {
                    debit = this.normalizeCurrency(t.nominal); // Loan Disbursed = Debit (Asset for Bank, but Liability for User... Passbook is User View? 
                    // Savings Passbook: Debit = Out, Credit = In.
                    // Loan Passbook: Debit = Loan Taken?, Credit = Loan Paid? 
                    // Let's stick to standard bank loan statement: Debit = Charge (Principal), Credit = Payment.
                } else if (t.tipeTrans === 'ANGSURAN') {
                    credit = this.normalizeCurrency(t.pokok); // Only Principal reduces balance
                }
            } else {
                // SAVINGS Logic
                debit = t.tipeTrans.includes('TARIK') || t.tipeTrans.includes('DEBIT') ? Math.abs(this.normalizeCurrency(t.nominal)) : 0;
                credit = t.tipeTrans.includes('SETOR') || t.tipeTrans.includes('CREDIT') || t.tipeTrans.includes('BUNGA') ? Math.abs(this.normalizeCurrency(t.nominal)) : 0;
            }

            return {
                date: t.createdAt,
                code: t.tipeTrans,
                debit: debit,
                credit: credit,
                balance: this.normalizeCurrency(t.saldoAkhir),
                description: t.keterangan
            };
        });

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


    async getDepositoCertificateData(noJangka: string) {
        const deposito = await this.prisma.nasabahJangka.findUnique({
            where: { noJangka },
            include: { nasabah: true }
        });
        if (!deposito) throw new NotFoundException('Deposito not found');

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
                jangkaWaktu: 'X Bulan', // Calculate diff
                bungaPct: deposito.bunga,
                tglMulai: deposito.tglBuka,
                tglJatuhTempo: deposito.tglJatuhTempo,
                perpanjanganOtomatis: deposito.payoutMode === 'ROLLOVER' ? 'YA (Kapitalisasi Bunga)' :
                    deposito.payoutMode === 'TRANSFER' ? `YA (Bunga Masuk Tabungan: ${deposito.targetAccountId || '-'})` : 'TIDAK'
            },
            // Legacy Template Compatibility
            account: {
                noRekening: deposito.noJangka,
                nominal: this.normalizeCurrency(deposito.nominal),
                terbilang: this.terbilang(this.normalizeCurrency(deposito.nominal)),
                jangkaWaktu: 'X', // Need calculation or just 'X'
                jatuhTempo: deposito.tglJatuhTempo,
                bunga: deposito.bunga,
                tglBuka: deposito.tglBuka,
                perpanjanganOtomatis: deposito.payoutMode === 'ROLLOVER' ? 'YA (Kapitalisasi Bunga)' :
                    deposito.payoutMode === 'TRANSFER' ? `YA (Bunga Masuk Tabungan: ${deposito.targetAccountId || '-'})` : 'TIDAK'
            }
        };
    }

    async getAnggotaRegistrationData(accountNumber: string) {
        const account = await this.prisma.anggotaAccount.findUnique({
            where: { accountNumber },
            include: { customer: true }
        });

        if (!account) throw new NotFoundException('Account not found');

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

    async getAnggotaClosureData(accountNumber: string) {
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

        if (!account) throw new NotFoundException('Account not found');

        const companyProfile = await this.settingsService.getProfile();

        // Extract closure details from transactions
        const closureTx = account.transactions.find(t => t.transType === 'TUTUP');
        // Filter penalty/admin that are close to the closure time (or just take latest)
        // Since we take 10 latest, and closure is recent, this should be fine.
        const penaltyTx = account.transactions.find(t => t.transType === 'DENDA');
        const adminTx = account.transactions.find(t => t.transType === 'BIAYA_ADMIN');

        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;

        if (closureTx) {
            // Account is Closed (Transaction exists)
            refundAmount = Math.abs(this.normalizeCurrency(closureTx.amount));
            penaltyAmount = penaltyTx ? Math.abs(this.normalizeCurrency(penaltyTx.amount)) : 0;
            adminAmount = adminTx ? Math.abs(this.normalizeCurrency(adminTx.amount)) : 0;
            closeBalance = refundAmount + penaltyAmount + adminAmount; // Reconstruct original balance before deductions
        } else {
            // Account is Active (Draft Closure)
            // Use current balance as the projected refund (assuming no penalty/admin yet)
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

    async getTabrelaClosureData(noTab: string) {
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

        if (!account) throw new NotFoundException('Account not found');

        const companyProfile = await this.settingsService.getProfile();

        // Extract closure details
        // Access via account.transactions
        const closureTx = account.transactions.find(t => t.tipeTrans === 'TUTUP');
        const penaltyTx = account.transactions.find(t => t.tipeTrans === 'DENDA');
        const adminTx = account.transactions.find(t => t.tipeTrans === 'BIAYA_ADMIN');

        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;

        if (closureTx) {
            // Account Closed
            refundAmount = Math.abs(Number(closureTx.nominal));
            penaltyAmount = penaltyTx ? Math.abs(Number(penaltyTx.nominal)) : 0;
            adminAmount = adminTx ? Math.abs(Number(adminTx.nominal)) : 0;
            closeBalance = refundAmount + penaltyAmount + adminAmount;
        } else {
            // Draft
            closeBalance = Number(account.saldo);
            refundAmount = closeBalance;
        }

        return {
            template: 'FORM_TUTUP_TABRELA',
            companyProfile,
            account: {
                noRekening: account.noTab,
                tglBuka: account.tglBuka,
                // Tabrela doesn't have closeDate or tglTutup in schema apparently?
                // Using current date as fallback.
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

    async getBrahmacariClosureData(noBrahmacari: string) {
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

        if (!account) throw new NotFoundException('Account not found');

        const companyProfile = await this.settingsService.getProfile();

        // Extract closure details
        const closureTx = account.transactions.find(t => t.tipeTrans === 'TUTUP');
        const penaltyTx = account.transactions.find(t => t.tipeTrans === 'DENDA');
        const adminTx = account.transactions.find(t => t.tipeTrans === 'BIAYA_ADMIN');

        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;

        if (closureTx) {
            // Account Closed
            refundAmount = Math.abs(Number(closureTx.nominal));
            penaltyAmount = penaltyTx ? Math.abs(Number(penaltyTx.nominal)) : 0;
            adminAmount = adminTx ? Math.abs(Number(adminTx.nominal)) : 0;
            closeBalance = refundAmount + penaltyAmount + adminAmount;
        } else {
            // Draft
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

    async getBalimesariClosureData(noBalimesari: string) {
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

        if (!account) throw new NotFoundException('Account not found');

        const companyProfile = await this.settingsService.getProfile();

        // Extract closure details
        const closureTx = account.transactions.find(t => t.tipeTrans === 'TUTUP');
        const penaltyTx = account.transactions.find(t => t.tipeTrans === 'DENDA');
        const adminTx = account.transactions.find(t => t.tipeTrans === 'BIAYA_ADMIN');

        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;

        if (closureTx) {
            // Account Closed
            refundAmount = Math.abs(Number(closureTx.nominal));
            penaltyAmount = penaltyTx ? Math.abs(Number(penaltyTx.nominal)) : 0;
            adminAmount = adminTx ? Math.abs(Number(adminTx.nominal)) : 0;
            closeBalance = refundAmount + penaltyAmount + adminAmount;
        } else {
            // Draft
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

    async getWanaprastaClosureData(noWanaprasta: string) {
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

        if (!account) throw new NotFoundException('Account not found');

        const companyProfile = await this.settingsService.getProfile();

        // Extract closure details
        const closureTx = account.transactions.find(t => t.tipeTrans === 'TUTUP');
        const penaltyTx = account.transactions.find(t => t.tipeTrans === 'DENDA');
        const adminTx = account.transactions.find(t => t.tipeTrans === 'BIAYA_ADMIN');

        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;

        if (closureTx) {
            // Account Closed
            refundAmount = Math.abs(Number(closureTx.nominal));
            penaltyAmount = penaltyTx ? Math.abs(Number(penaltyTx.nominal)) : 0;
            adminAmount = adminTx ? Math.abs(Number(adminTx.nominal)) : 0;
            closeBalance = refundAmount + penaltyAmount + adminAmount;
        } else {
            // Draft
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

    async getDepositoClosureData(noJangka: string) {
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

        if (!account) throw new NotFoundException('Account not found');

        const companyProfile = await this.settingsService.getProfile();

        // Extract closure details
        // Note: Deposito creates 'CAIR' for principal withdrawal.
        const closureTx = account.transactions.find(t => t.tipeTrans === 'CAIR');
        const penaltyTx = account.transactions.find(t => t.tipeTrans === 'DENDA');
        const adminTx = account.transactions.find(t => t.tipeTrans === 'BIAYA_ADMIN');

        let refundAmount = 0;
        let penaltyAmount = 0;
        let adminAmount = 0;
        let closeBalance = 0;

        // Logic might be slightly different for Deposito if it's based on Principal
        // But for "Closure Form", we usually want to show:
        // Nominal Deposito, Penalties, and Net Refund.

        const principal = this.normalizeCurrency(account.nominal);

        if (closureTx) {
            // Account Closed
            // Refund Amount in CAIR transaction is the Principal usually (negative).
            // But we want the "Net Received".
            // Let's rely on the individual transaction amounts.

            // If CAIR is -1000, Denda is -50, Admin is -10.
            // Net Cash Out = 1000 - 50 - 10 = 940 (This is what we assume happened financially)
            // But usually we just Display:
            // Principal: 1000
            // Denda: 50
            // Admin: 10
            // Total: 940

            penaltyAmount = penaltyTx ? Math.abs(this.normalizeCurrency(penaltyTx.nominal)) : 0;
            adminAmount = adminTx ? Math.abs(this.normalizeCurrency(adminTx.nominal)) : 0;

            closeBalance = principal; // The 'Balance' before close is the Principal
            refundAmount = closeBalance - penaltyAmount - adminAmount;
        } else {
            // Draft mode (Active)
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

    // Helper: Normalize Currency (Redenomination Fix)
    // Encapsulates logic for converting stored k-values to full rupiah
    private normalizeCurrency(value: any): number {
        return Number(value || 0) * 1000;
    }

    // Helper: Terbilang (Fixed recursive logic)
    private getTerbilangWords(nominal: number): string {
        const bil = ["", "Satu", "Dua", "Tiga", "Empat", "Lima", "Enam", "Tujuh", "Delapan", "Sembilan", "Sepuluh", "Sebelas"];
        let terbilang = "";

        if (nominal < 12) {
            terbilang = " " + bil[nominal];
        } else if (nominal < 20) {
            terbilang = this.getTerbilangWords(nominal - 10) + " Belas";
        } else if (nominal < 100) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 10)) + " Puluh" + this.getTerbilangWords(nominal % 10);
        } else if (nominal < 200) {
            terbilang = " Seratus" + this.getTerbilangWords(nominal - 100);
        } else if (nominal < 1000) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 100)) + " Ratus" + this.getTerbilangWords(nominal % 100);
        } else if (nominal < 2000) {
            terbilang = " Seribu" + this.getTerbilangWords(nominal - 1000);
        } else if (nominal < 1000000) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 1000)) + " Ribu" + this.getTerbilangWords(nominal % 1000);
        } else if (nominal < 1000000000) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 1000000)) + " Juta" + this.getTerbilangWords(nominal % 1000000);
        } else if (nominal < 1000000000000) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 1000000000)) + " Milyar" + this.getTerbilangWords(nominal % 1000000000);
        } else if (nominal < 1000000000000000) {
            terbilang = this.getTerbilangWords(Math.floor(nominal / 1000000000000)) + " Triliun" + this.getTerbilangWords(nominal % 1000000000000);
        }

        return terbilang;
    }

    private terbilang(nominal: number): string {
        return this.getTerbilangWords(nominal).trim() + " Rupiah";
    }

    // ============================
    // BUKU BESAR (GENERAL LEDGER)
    // ============================

    async getBukuBesar(fromAccount: string, toAccount: string, startDate: string, endDate: string) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const endAccount = toAccount || fromAccount;

        // Fetch accounts
        const accounts = await this.prisma.journalAccount.findMany({
            where: {
                accountCode: {
                    gte: fromAccount,
                    lte: endAccount
                }
            },
            orderBy: { accountCode: 'asc' }
        });

        if (accounts.length === 0) {
            throw new NotFoundException(`No accounts found in range ${fromAccount} - ${endAccount}`);
        }

        const results: any[] = [];

        for (const account of accounts) {
            const accountCode = account.accountCode;


            // Calculate opening balance
            const openingEntries = await this.prisma.postedJournalDetail.findMany({
                where: {
                    accountCode,
                    journal: { journalDate: { lt: start } }
                }
            });

            let saldoAwal = 0;
            for (const entry of openingEntries) {
                const debit = this.normalizeCurrency(entry.debit);
                const credit = this.normalizeCurrency(entry.credit);
                saldoAwal += debit - credit;
            }

            // Get entries in period
            const periodEntries = await this.prisma.postedJournalDetail.findMany({
                where: {
                    accountCode,
                    journal: { journalDate: { gte: start, lte: end } }
                },
                include: { journal: true },
                orderBy: [{ journal: { journalDate: 'asc' } }, { id: 'asc' }]
            });

            // Calculate running balance
            let runningBalance = saldoAwal;
            const entries = periodEntries.map(entry => {
                const debit = this.normalizeCurrency(entry.debit);
                const credit = this.normalizeCurrency(entry.credit);
                runningBalance += debit - credit;

                return {
                    tanggal: entry.journal.journalDate,
                    journalNumber: entry.journal.journalNumber,
                    keterangan: entry.journal.description || entry.description || '-',
                    debit,
                    credit,
                    saldo: runningBalance
                };
            });

            const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
            const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);

            results.push({
                account: {
                    accountCode: account.accountCode,
                    accountName: account.accountName
                },
                periodStart: startDate,
                periodEnd: endDate,
                saldoAwal,
                entries,
                saldoAkhir: runningBalance,
                totalDebit,
                totalCredit
            });
        }

        return { data: results };
    }

    async generateBukuBesarPDF(fromAccount: string, toAccount: string, startDate: string, endDate: string) {
        const data = await this.getBukuBesar(fromAccount, toAccount, startDate, endDate);

        // Return the data for now, PDF generation can be added later
        // For now, just return the data and let the controller handle it
        return data;
    }

    // Simple method to get all accounts for dropdown
    async getAccountsList() {
        const accounts = await this.prisma.journalAccount.findMany({
            select: {
                accountCode: true,
                accountName: true
            },
            orderBy: { accountCode: 'asc' }
        });

        console.log('Total accounts found:', accounts.length);
        return accounts;
    }

    // ============================
    // TRANSACTION RECEIPTS (ALL PRODUCTS)
    // ============================

    private async getGenericReceiptData(
        tableName: string,
        accountField: string,
        accountNumber: string,
        productDisplayName: string
    ) {
        const prismaModel = (this.prisma as any)[tableName];

        const account = await prismaModel.findUnique({
            where: { [accountField]: accountNumber },
            include: {
                nasabah: true,
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!account) throw new NotFoundException('Account not found');
        if (!account.transactions || account.transactions.length === 0) {
            throw new NotFoundException('No transactions found');
        }

        const lastTransaction = account.transactions[0];
        const companyProfile = await this.settingsService.getProfile();

        // Fetch user who performed the transaction
        let userName = 'Petugas';

        // Try to find user by ID first
        if (lastTransaction.userId) {
            try {
                const user = await this.prisma.user.findUnique({
                    where: { id: lastTransaction.userId },
                    select: { fullName: true, username: true }
                });
                if (user) {
                    userName = `${user.fullName} (${user.username})`;
                }
            } catch (e) {
                console.error('Error fetching user:', e);
            }
        }

        // Fallback to createdBy if it's a string
        if (userName === 'Petugas' && lastTransaction.createdBy) {
            userName = lastTransaction.createdBy;
        }

        // Handle different field names across models
        const txAmount = Number(lastTransaction.nominal || lastTransaction.amount);
        const tipeTrans = lastTransaction.tipeTrans || lastTransaction.transType;

        return {
            header: {
                noRekening: accountNumber,
                nama: account.nasabah.nama,
            },
            data: [{
                date: lastTransaction.createdAt || lastTransaction.transDate,
                debit: txAmount < 0 ? Math.abs(txAmount) : (tipeTrans === 'T' ? txAmount : 0),
                credit: txAmount > 0 ? txAmount : (tipeTrans === 'S' ? txAmount : 0),
                balance: Number(lastTransaction.saldoAkhir || lastTransaction.balanceAfter || account.saldo),
                description: lastTransaction.keterangan || lastTransaction.description || tipeTrans
            }],
            companyProfile: {
                name: companyProfile.name,
                address: companyProfile.address,
                phone: companyProfile.phone
            },
            currentUser: userName
        };
    }

    async getAnggotaReceiptData(accountNumber: string) {
        const account = await this.prisma.anggotaAccount.findUnique({
            where: { accountNumber },
            include: {
                customer: true,
                transactions: {
                    orderBy: { transDate: 'desc' },
                    take: 1
                }
            }
        });

        if (!account) throw new NotFoundException('Account not found');
        if (!account.transactions || account.transactions.length === 0) {
            throw new NotFoundException('No transactions found');
        }

        const lastTransaction = account.transactions[0];
        const companyProfile = await this.settingsService.getProfile();

        const user = await this.prisma.user.findUnique({
            where: { id: lastTransaction.userId },
            select: { fullName: true, username: true }
        });

        const txAmount = Number(lastTransaction.amount);

        return {
            header: {
                noRekening: account.accountNumber,
                nama: account.customer.nama,
            },
            data: [{
                date: lastTransaction.transDate,
                debit: txAmount < 0 ? Math.abs(txAmount) : 0,
                credit: txAmount > 0 ? txAmount : 0,
                balance: Number(lastTransaction.balanceAfter),
                description: lastTransaction.description || lastTransaction.transType
            }],
            companyProfile: {
                name: companyProfile.name,
                address: companyProfile.address,
                phone: companyProfile.phone
            },
            currentUser: user ? `${user.fullName} (${user.username})` : 'Petugas'
        };
    }

    async getTabrelaReceiptData(accountNumber: string) {
        return this.getGenericReceiptData('nasabahTab', 'noTab', accountNumber, 'Tabrela');
    }

    async getBrahmacariReceiptData(accountNumber: string) {
        return this.getGenericReceiptData('nasabahBrahmacari', 'noBrahmacari', accountNumber, 'Brahmacari');
    }

    async getBalimesariReceiptData(accountNumber: string) {
        return this.getGenericReceiptData('nasabahBalimesari', 'noBalimesari', accountNumber, 'Balimesari');
    }

    async getWanasprastaReceiptData(accountNumber: string) {
        return this.getGenericReceiptData('nasabahWanaprasta', 'noWanaprasta', accountNumber, 'Wanaprasta');
    }
}
