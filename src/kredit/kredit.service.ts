import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma } from '@prisma/client';
import { AccountingService } from '../accounting/accounting.service';

@Injectable()
export class KreditService {
    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => AccountingService))
        private accountingService: AccountingService,
    ) { }

    // ============================================
    // 1. APPLICATION (OPEN)
    // ============================================

    async createApplication(data: any, userId: number) {
        const noPermohonan = await this.generatePermohonanNumber();

        return this.prisma.debiturKredit.create({
            data: {
                nasabahId: data.nasabahId,
                noPermohonan,
                jenisKredit: data.jenisKredit,
                tujuanKredit: data.tujuanKredit,
                nominalPengajuan: new Prisma.Decimal(data.nominalPengajuan),
                mohonJangkaWaktu: data.mohonJangkaWaktu,
                mohonSukuBunga: new Prisma.Decimal(data.mohonSukuBunga),
                metodeAngsuran: data.metodeAngsuran,
                sistemBunga: data.sistemBunga,
                tglPengajuan: new Date(),
                status: 'OPEN',
                createdBy: userId.toString(),
            },
        });
    }

    private async generatePermohonanNumber(): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const prefix = `PK/${year}/${month}`;

        const count = await this.prisma.debiturKredit.count({
            where: { noPermohonan: { startsWith: prefix } },
        });

        return `${prefix}/${String(count + 1).padStart(4, '0')}`;
    }

    // ============================================
    // 2. COLLATERAL MANAGEMENT
    // ============================================

    async addCollateral(creditId: number, data: any, userId: number) {
        try {
            // Explicit Parsing & Validation to local variables
            const nasabahId = parseInt(data.nasabahId);
            if (isNaN(nasabahId)) throw new BadRequestException('Invalid Nasabah ID');

            const type = data.type;
            if (!type) throw new BadRequestException('Collateral type is required');

            const marketVal = parseFloat(data.marketValue || '0');
            const assessedVal = parseFloat(data.assessedValue || '0');

            if (isNaN(marketVal) || isNaN(assessedVal)) throw new BadRequestException('Invalid market or assessed value');
            if (marketVal < 0 || assessedVal < 0) throw new BadRequestException('Values must be positive');

            // Ensure details is an object (Prisma Json expectation)
            let detailsObj = data.details;
            if (typeof detailsObj === 'string') {
                try {
                    detailsObj = JSON.parse(detailsObj);
                } catch (e) {
                    // If parse fails, treat as simple string wrapped in object or leave as is if acceptable
                    // Generally Prisma expects valid JSON value.
                    console.warn('Failed to parse details JSON string:', detailsObj);
                }
            }

            return await this.prisma.$transaction(async (tx) => {
                // 1. Create Collateral Master
                const collateral = await tx.collateral.create({
                    data: {
                        nasabahId: nasabahId, // STRICTLY use the parsed integer variable
                        type: type,
                        description: data.description || '',
                        marketValue: new Prisma.Decimal(marketVal),
                        assessedValue: new Prisma.Decimal(assessedVal),
                        details: detailsObj ?? Prisma.JsonNull,
                        photos: data.photos || null,
                        status: 'ACTIVE',
                        createdBy: userId.toString(),
                    },
                });

                // 2. Link to Credit Application
                await tx.kreditCollateral.create({
                    data: {
                        creditId: creditId, // Ensure creditId is number
                        collateralId: collateral.id,
                    },
                });

                return collateral;
            });
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            console.error('Add Collateral Service Error:', error);
            throw new BadRequestException(`Failed to add collateral: ${error.message}`);
        }
    }

    // ============================================
    // 3. ANALYSIS (ANALYZE)
    // ============================================

    async submitAnalysis(creditId: number, data: any, userId: number) {
        return this.prisma.$transaction(async (tx) => {
            // 1. Create/Update Analysis
            const analysis = await tx.creditAnalysis.upsert({
                where: { debiturKreditId: creditId },
                update: {
                    characterScore: data.characterScore,
                    characterDesc: data.characterDesc,
                    capitalScore: data.capitalScore,
                    capitalDesc: data.capitalDesc,
                    capacityScore: data.capacityScore,
                    capacityDesc: data.capacityDesc,
                    conditionScore: data.conditionScore,
                    conditionDesc: data.conditionDesc,
                    collateralScore: data.collateralScore,
                    collateralDesc: data.collateralDesc,
                    totalScore: data.totalScore,
                    recommendation: data.recommendation,
                    updatedBy: userId.toString(),
                },
                create: {
                    debiturKreditId: creditId,
                    characterScore: data.characterScore,
                    characterDesc: data.characterDesc,
                    capitalScore: data.capitalScore,
                    capitalDesc: data.capitalDesc,
                    capacityScore: data.capacityScore,
                    capacityDesc: data.capacityDesc,
                    conditionScore: data.conditionScore,
                    conditionDesc: data.conditionDesc,
                    collateralScore: data.collateralScore,
                    collateralDesc: data.collateralDesc,
                    totalScore: data.totalScore,
                    recommendation: data.recommendation,
                    createdBy: userId.toString(),
                },
            });

            // 2. Update Status to ANALYZE if it was OPEN
            await tx.debiturKredit.update({
                where: { id: creditId },
                data: { status: 'ANALYZE' },
            });

            return analysis;
        });
    }

    // ============================================
    // 4. APPROVAL & ACTIVATION
    // ============================================

    async approveCredit(creditId: number, decision: any, userId: number) {
        return this.prisma.debiturKredit.update({
            where: { id: creditId },
            data: {
                status: decision.status, // APPROVE or CANCEL
                updatedBy: userId.toString(),
            },
        });
    }

    async activateCredit(creditId: number, data: any, userId: number) {
        const credit = await this.prisma.debiturKredit.findUnique({
            where: { id: creditId },
            include: { nasabah: true },
        });

        if (!credit || credit.status !== 'APPROVE') {
            throw new BadRequestException('Credit application is not approved or not found');
        }

        const nomorKredit = await this.generateAccountNumber(credit.nasabahId);

        return this.prisma.$transaction(async (tx) => {
            try {
                // 1. Set Facilities
                await tx.debiturFasilitas.create({
                    data: {
                        debiturKreditId: creditId,
                        nominal: new Prisma.Decimal(data.plafond),
                        bunga: new Prisma.Decimal(data.bungaPct),
                        jangkaWaktu: data.jangkaWaktu,
                        angsuranPokok: new Prisma.Decimal(data.angsuranPokok),
                        angsuranBunga: new Prisma.Decimal(data.angsuranBunga),
                        createdBy: userId.toString(),
                    },
                });

                // 2. Record Realization
                const realization = await tx.debiturRealisasi.create({
                    data: {
                        debiturKreditId: creditId,
                        tglRealisasi: new Date(),
                        nominalRealisasi: new Prisma.Decimal(data.plafond),
                        createdBy: userId.toString(),
                    },
                });

                // 3. Post Journal (Automated with Mapping)
                // Fetch Mapping
                const mapping = await tx.productCoaMapping.findUnique({
                    where: { transType: 'KREDIT_REALISASI' }
                });

                if (!mapping) {
                    throw new BadRequestException('Konfigurasi COA Mapping untuk [KREDIT_REALISASI] belum tersedia. Hubungi Administrator.');
                }

                const journalDetails = [
                    { accountCode: mapping.debitAccount, debit: Number(data.plafond), credit: 0, description: `Pencairan Kredit ${nomorKredit}` },
                    { accountCode: mapping.creditAccount, debit: 0, credit: Number(data.plafond), description: `Pencairan Kredit ${nomorKredit}` },
                ];

                // FIX: Generate No via Service, but CREATE using TX to ensure visibility
                const journalNo = await this.accountingService.generateJournalNumber(new Date());

                // Create Journal directly in transaction
                await tx.postedJournal.create({
                    data: {
                        journalNumber: journalNo,
                        journalDate: new Date(),
                        description: `Realisasi Kredit ${nomorKredit} - ${credit.nasabah.nama}`,
                        postingType: 'AUTO',
                        sourceCode: 'KREDIT',
                        refId: realization.id,
                        userId: userId,
                        status: 'POSTED',
                        transType: 'KREDIT_REALISASI',
                        details: {
                            create: journalDetails.map(d => ({
                                accountCode: d.accountCode,
                                debit: d.debit,
                                credit: d.credit,
                                description: d.description
                            }))
                        }
                    }
                });

                // 4. Generate & Save Installment Schedule (Jadwal Angsuran)
                const schedule = this.calculateInstallmentSchedule(
                    Number(data.plafond),
                    Number(data.bungaPct),
                    Number(data.jangkaWaktu),
                    new Date() // Start Date is Realization Date
                );

                await tx.debiturJadwal.createMany({
                    data: schedule.map(s => ({
                        debiturKreditId: creditId,
                        angsuranKe: s.angsuranKe,
                        tglJatuhTempo: s.tglJatuhTempo,
                        pokok: new Prisma.Decimal(s.pokok),
                        bunga: new Prisma.Decimal(s.bunga),
                        total: new Prisma.Decimal(s.total),
                        sisaPokok: new Prisma.Decimal(s.pokok),
                        sisaBunga: new Prisma.Decimal(s.bunga),
                        status: 'UNPAID',
                        createdBy: 'SYSTEM'
                    }))
                });

                // 5. Update Credit Status to ACTIVE
                return await tx.debiturKredit.update({
                    where: { id: creditId },
                    data: {
                        nomorKredit,
                        status: 'ACTIVE',
                        updatedBy: userId.toString(),
                    },
                });
            } catch (error) {
                console.error('Credit Activation Error:', error);

                if (error instanceof Prisma.PrismaClientKnownRequestError) {
                    if (error.code === 'P2003') { // Foreign Key Violation
                        throw new BadRequestException('Terjadi kesalahan data referensi (Akun Akuntansi tidak ditemukan). Harap periksa konfigurasi Chart of Account.');
                    }
                }
                if (error instanceof BadRequestException) throw error;

                throw new BadRequestException(`Gagal merealisasikan kredit: ${error.message}`);
            }
        });
    }

    // ============================================
    // 5. PAYMENT (ANGSURAN)
    // ============================================

    async payInstallment(creditId: number, data: any, userId: number) {
        const credit = await this.prisma.debiturKredit.findUnique({
            where: { id: creditId },
            include: { nasabah: true }
        });

        if (!credit || credit.status !== 'ACTIVE') {
            throw new BadRequestException('Credit is not ACTIVE or not found');
        }

        const paymentAmount = Number(data.amount);
        if (paymentAmount <= 0) throw new BadRequestException('Payment amount must be positive');

        const paymentDate = data.date ? new Date(data.date) : new Date();

        return this.prisma.$transaction(async (tx) => {
            // 1. Record Transaction History
            const trans = await tx.transKredit.create({
                data: {
                    debiturKreditId: creditId,
                    tipeTrans: 'ANGSURAN',
                    nominal: new Prisma.Decimal(paymentAmount),
                    keterangan: data.description || 'Pembayaran Angsuran Kredit',
                    createdBy: userId.toString(),
                    createdAt: paymentDate
                }
            });

            // 2. Allocate Payment (Interest First, then Principal)
            // Fetch UNPAID schedules (UNPAID or PARTIAL)
            const schedules = await tx.debiturJadwal.findMany({
                where: {
                    debiturKreditId: creditId,
                    status: { in: ['UNPAID', 'PARTIAL'] }
                },
                orderBy: { angsuranKe: 'asc' }
            });

            let remainingMoney = Number(paymentAmount);
            const journalDetailsData: { account: string, debit: number, credit: number, desc: string }[] = [];

            // COA Mapping (Standard behavior or Fallback)
            const mapping = await tx.productCoaMapping.findUnique({ where: { transType: 'KREDIT_ANGSURAN' } });
            const cashAccount = mapping?.debitAccount || '10100'; // Default Cash
            const receivableAccount = mapping?.creditAccount || '10300'; // Default Piutang

            // Interest Income Mapping
            const interestMapping = await tx.productCoaMapping.findUnique({ where: { transType: 'KREDIT_BUNGA' } });
            const interestIncomeAccount = interestMapping?.creditAccount || '40100'; // Default Interest Income

            let totalPrincipalPaid = 0;
            let totalInterestPaid = 0;

            for (const sched of schedules) {
                if (remainingMoney <= 0) break;

                // Outstanding amounts
                // If sisaBunga is null (legacy data), assume it matches bunga if status is not PAID, else 0.
                // But for robust logic, strict "Interest First" means we assume full interest is due if sisaBunga is missing.
                // However, we just added the column default 0.
                // MIGRATION FIX: If sisaBunga is 0 but status != PAID and sisaPokok == pokok, likely unmigrated.
                // For this implementation, we assume NEW data or handled data.
                // We will treat `sisaBunga` as the source of truth for Interest Due.

                // If sisaBunga is 0 and status is UNPAID/PARTIAL, is it really 0?
                // Ideally we should have initialized it.
                // For safety: if sisaBunga is 0 and sisaPokok == pokok (untouched), we could force it to equal bunga.
                // But let's trust the data for now or users might get free interest.

                let interestDue = Number(sched.sisaBunga);
                let principalDue = Number(sched.sisaPokok);

                // FIX FOR LEGACY DATA:
                // If sisaBunga is 0 BUT status is UNPAID (or PARTIAL with untouched principal), assume interest is fully due.
                // This prevents users from skipping interest payment on old credits.
                if (interestDue === 0 && Number(sched.bunga) > 0) {
                    if (sched.status === 'UNPAID' || (sched.status === 'PARTIAL' && principalDue >= Number(sched.pokok) - 100)) {
                        interestDue = Number(sched.bunga);
                    }
                }


                // --- LOGIC: PAY INTEREST FIRST ---
                let payInt = 0;
                if (interestDue > 0) {
                    payInt = Math.min(remainingMoney, interestDue);
                    interestDue -= payInt;
                    remainingMoney -= payInt;
                    totalInterestPaid += payInt;
                }

                // --- LOGIC: PAY PRINCIPAL NEXT ---
                let payPrin = 0;
                if (remainingMoney > 0 && principalDue > 0) {
                    payPrin = Math.min(remainingMoney, principalDue);
                    principalDue -= payPrin;
                    remainingMoney -= payPrin;
                    totalPrincipalPaid += payPrin;
                }

                // Update Schedule if changed
                if (payInt > 0 || payPrin > 0) {
                    let newStatus = 'PARTIAL';
                    if (interestDue <= 0.01 && principalDue <= 0.01) {
                        newStatus = 'PAID';
                    }

                    await tx.debiturJadwal.update({
                        where: { id: sched.id },
                        data: {
                            sisaBunga: new Prisma.Decimal(interestDue),
                            sisaPokok: new Prisma.Decimal(principalDue),
                            status: newStatus,
                            tglBayar: new Date(),
                            updatedBy: userId.toString()
                        }
                    });
                }
            }

            // 3. Journal Entires
            // Cash Debit
            if (totalPrincipalPaid + totalInterestPaid > 0) {
                // Generate Journal Number
                const journalNo = await this.accountingService.generateJournalNumber(paymentDate);

                const journalDetails = [
                    // Debit Cash
                    {
                        accountCode: cashAccount,
                        debit: totalPrincipalPaid + totalInterestPaid,
                        credit: 0,
                        description: `Pembayaran Angsuran ${credit.nomorKredit}`
                    }
                ];

                // Credit Principal (Piutang)
                if (totalPrincipalPaid > 0) {
                    journalDetails.push({
                        accountCode: receivableAccount,
                        debit: 0,
                        credit: totalPrincipalPaid,
                        description: `Angsuran Pokok ${credit.nomorKredit}`
                    });
                }

                // Credit Interest (Pendapatan)
                if (totalInterestPaid > 0) {
                    journalDetails.push({
                        accountCode: interestIncomeAccount,
                        debit: 0,
                        credit: totalInterestPaid,
                        description: `Angsuran Bunga ${credit.nomorKredit}`
                    });
                }

                await tx.postedJournal.create({
                    data: {
                        journalNumber: journalNo,
                        journalDate: paymentDate,
                        description: `Angsuran Kredit ${credit.nomorKredit} - ${credit.nasabah.nama}`,
                        postingType: 'AUTO',
                        sourceCode: 'KREDIT',
                        refId: trans.id,
                        userId: userId,
                        status: 'POSTED',
                        transType: 'KREDIT_ANGSURAN',
                        details: {
                            create: journalDetails
                        }
                    }
                });
            }

            return {
                message: 'Payment recorded successfully',
                allocatedPrincipal: totalPrincipalPaid,
                allocatedInterest: totalInterestPaid,
                remainingDeposit: remainingMoney
            };
        }).catch(error => {
            console.error("PAY INSTALLMENT ERROR:", error);
            throw error;
        });
    }

    private async generateAccountNumber(nasabahId: number): Promise<string> {
        // Simplified account number logic: K.NASABAH_ID.SEQUENCE
        const count = await this.prisma.debiturKredit.count({
            where: { nomorKredit: { not: null } }
        });
        return `K-${String(nasabahId).padStart(4, '0')}-${String(count + 1).padStart(3, '0')}`;
    }

    private calculateInstallmentSchedule(plafond: number, bungaPct: number, duration: number, startDate: Date) {
        const schedule: any[] = [];
        let currentSisaPokok = plafond;

        // FLAT Calculation Assumption (Bunga Menetap)
        // Pokok = Plafond / Jangka Waktu
        // Bunga = Plafond * (Rate / 100) -> Asumsi Rate per Bulan

        // Calculate principal per month (keep precision)
        const angsuranPokok = plafond / duration;
        const angsuranBunga = plafond * (bungaPct / 100);

        for (let i = 1; i <= duration; i++) {
            // Determine Principal for this month
            let currentPokok = angsuranPokok;

            // Adjust last month to match remaining balance explicitly
            if (i === duration) {
                currentPokok = currentSisaPokok;
            }

            // Update Remaining Balance
            currentSisaPokok -= currentPokok;

            // Ensure 0 if tiny precision error
            if (currentSisaPokok < 0.0001 && currentSisaPokok > -0.0001) currentSisaPokok = 0;

            const currentTotal = currentPokok + angsuranBunga;

            // Due Date: Same day next month
            const dueDate = new Date(startDate);
            dueDate.setMonth(startDate.getMonth() + i);

            schedule.push({
                angsuranKe: i,
                tglJatuhTempo: dueDate,
                pokok: currentPokok,
                bunga: angsuranBunga,
                total: currentTotal,
                sisaPokok: currentSisaPokok
            });
        }
        return schedule;
    }

    // ============================================
    // 5. PAYMENT PROCESSING (Flexible Payment)
    // ============================================

    async processPayment(creditId: number, paymentData: any, userId: number) {
        return await this.prisma.$transaction(async (tx) => {
            // 1. Get credit with unpaid/partial schedules
            const credit = await tx.debiturKredit.findUnique({
                where: { id: creditId },
                include: {
                    nasabah: true,
                    jadwal: {
                        where: {
                            OR: [
                                { status: 'UNPAID' },
                                { status: 'PARTIAL' }
                            ]
                        },
                        orderBy: { tglJatuhTempo: 'asc' }
                    }
                }
            });

            if (!credit || credit.status !== 'ACTIVE') {
                throw new BadRequestException('Kredit tidak aktif');
            }

            if (credit.jadwal.length === 0) {
                throw new BadRequestException('Tidak ada angsuran yang perlu dibayar');
            }

            let remainingPayment = Number(paymentData.amount);
            const paymentDate = new Date(paymentData.paymentDate || new Date());
            const updatedSchedules = [];

            let totalPokokPaid = 0;
            let totalBungaPaid = 0;
            let totalPenaltyPaid = 0;

            // 2. Process payment allocation across installments
            for (const schedule of credit.jadwal) {
                if (remainingPayment <= 0) break;

                // Calculate outstanding amounts for this installment
                const outstandingPenalty = Number(schedule.assessedPenalty) - Number(schedule.paidPenalty);
                const outstandingInterest = Number(schedule.bunga) - Number(schedule.paidInterest);
                const outstandingPrincipal = Number(schedule.pokok) - Number(schedule.paidPrincipal);

                // Check if penalty needs to be assessed (payment < outstanding interest AND first payment attempt)
                let penaltyToAssess = 0;
                if (Number(schedule.paidInterest) === 0 &&
                    remainingPayment < outstandingInterest &&
                    Number(schedule.assessedPenalty) === 0) {
                    penaltyToAssess = this.calculatePenalty(schedule.tglJatuhTempo, paymentDate);
                }

                // Allocation order: Penalty → Interest → Principal
                let paidPenalty = 0;
                let paidInterest = 0;
                let paidPrincipal = 0;

                // 1. Allocate to Penalty
                const totalPenalty = outstandingPenalty + penaltyToAssess;
                if (totalPenalty > 0 && remainingPayment > 0) {
                    paidPenalty = Math.min(remainingPayment, totalPenalty);
                    remainingPayment -= paidPenalty;
                }

                // 2. Allocate to Interest (PRIORITY)
                if (outstandingInterest > 0 && remainingPayment > 0) {
                    paidInterest = Math.min(remainingPayment, outstandingInterest);
                    remainingPayment -= paidInterest;
                }

                // 3. Allocate to Principal
                if (outstandingPrincipal > 0 && remainingPayment > 0) {
                    paidPrincipal = Math.min(remainingPayment, outstandingPrincipal);
                    remainingPayment -= paidPrincipal;
                }

                // Update schedule tracking
                const newPaidPrincipal = Number(schedule.paidPrincipal) + paidPrincipal;
                const newPaidInterest = Number(schedule.paidInterest) + paidInterest;
                const newPaidPenalty = Number(schedule.paidPenalty) + paidPenalty;
                const newAssessedPenalty = Number(schedule.assessedPenalty) + penaltyToAssess;
                const newTotalPaid = Number(schedule.totalPaid) + paidPenalty + paidInterest + paidPrincipal;

                // Determine new status
                let newStatus = schedule.status;
                if (newPaidPrincipal >= Number(schedule.pokok) &&
                    newPaidInterest >= Number(schedule.bunga) &&
                    newPaidPenalty >= newAssessedPenalty) {
                    newStatus = 'PAID';
                } else if (newTotalPaid > 0) {
                    newStatus = 'PARTIAL';
                }

                await tx.debiturJadwal.update({
                    where: { id: schedule.id },
                    data: {
                        paidPrincipal: new Prisma.Decimal(newPaidPrincipal),
                        paidInterest: new Prisma.Decimal(newPaidInterest),
                        paidPenalty: new Prisma.Decimal(newPaidPenalty),
                        assessedPenalty: new Prisma.Decimal(newAssessedPenalty),
                        totalPaid: new Prisma.Decimal(newTotalPaid),
                        status: newStatus,
                        tglBayar: newStatus === 'PAID' ? paymentDate : schedule.tglBayar,
                        updatedBy: userId.toString()
                    }
                });

                totalPokokPaid += paidPrincipal;
                totalBungaPaid += paidInterest;
                totalPenaltyPaid += paidPenalty;

                updatedSchedules.push({
                    angsuranKe: schedule.angsuranKe,
                    paidPrincipal,
                    paidInterest,
                    paidPenalty,
                    penaltyAssessed: penaltyToAssess
                });
            }

            // 3. Create Payment Transaction Record
            const paymentRecord = await tx.transKredit.create({
                data: {
                    debiturKreditId: creditId,
                    tipeTrans: 'PAYMENT',
                    tglTrans: paymentDate,
                    nominal: new Prisma.Decimal(paymentData.amount),
                    pokokBayar: new Prisma.Decimal(totalPokokPaid),
                    bungaBayar: new Prisma.Decimal(totalBungaPaid),
                    dendaBayar: new Prisma.Decimal(totalPenaltyPaid),
                    keterangan: paymentData.keterangan || `Pembayaran Angsuran ${credit.nomorKredit}`,
                    createdBy: userId.toString()
                }
            });

            // 4. POST JOURNAL (Auto-posting)
            const journalDetails = [
                {
                    accountCode: '1.01.01', // Kas Kantor
                    debit: Number(paymentData.amount),
                    credit: 0,
                    description: `Penerimaan Angsuran ${credit.nomorKredit}`
                }
            ];

            if (totalPokokPaid > 0) {
                journalDetails.push({
                    accountCode: '1.20.01', // Pinjaman Anggota (Kredit)
                    debit: 0,
                    credit: totalPokokPaid,
                    description: `Pembayaran Pokok ${credit.nomorKredit}`
                });
            }

            if (totalBungaPaid > 0) {
                journalDetails.push({
                    accountCode: '4.01.01', // Pendapatan Bunga Kredit
                    debit: 0,
                    credit: totalBungaPaid,
                    description: `Pendapatan Bunga ${credit.nomorKredit}`
                });
            }

            if (totalPenaltyPaid > 0) {
                journalDetails.push({
                    accountCode: '4.01.02', // Pendapatan Denda
                    debit: 0,
                    credit: totalPenaltyPaid,
                    description: `Pendapatan Denda ${credit.nomorKredit}`
                });
            }

            const journalNo = await this.accountingService.generateJournalNumber(paymentDate);

            const journal = await tx.postedJournal.create({
                data: {
                    journalNumber: journalNo,
                    journalDate: paymentDate,
                    description: `Pembayaran Kredit ${credit.nomorKredit} - ${credit.nasabah.nama}`,
                    postingType: 'AUTO',
                    sourceCode: 'KREDIT',
                    transType: 'KREDIT_PAYMENT',
                    refId: paymentRecord.id,
                    userId: userId,
                    status: 'POSTED',
                    details: {
                        create: journalDetails.map(d => ({
                            accountCode: d.accountCode,
                            debit: d.debit,
                            credit: d.credit,
                            description: d.description
                        }))
                    }
                }
            });

            // Update payment record with journal link
            await tx.transKredit.update({
                where: { id: paymentRecord.id },
                data: { journalId: journal.id }
            });

            return {
                paymentId: paymentRecord.id,
                journalId: journal.id,
                processedAmount: Number(paymentData.amount),
                breakdown: {
                    principal: totalPokokPaid,
                    interest: totalBungaPaid,
                    penalty: totalPenaltyPaid
                },
                schedules: updatedSchedules,
                remainingBalance: remainingPayment
            };
        });
    }

    private calculatePenalty(dueDate: Date, paymentDate: Date): number {
        // Fixed penalty for late payment
        const FIXED_PENALTY = 50000; // Rp 50,000

        // Only assess penalty if payment is after due date
        if (paymentDate <= dueDate) {
            return 0;
        }

        const daysLate = Math.floor((paymentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

        // Return fixed penalty if late
        return daysLate > 0 ? FIXED_PENALTY : 0;
    }

    // ============================================
    // QUERIES
    // ============================================

    async findAll(page: number = 1, limit: number = 10, status?: string) {
        const skip = (page - 1) * limit;
        const where: any = {};
        if (status) where.status = status;

        const [data, total] = await Promise.all([
            this.prisma.debiturKredit.findMany({
                where,
                include: { nasabah: true },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.debiturKredit.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        const credit = await this.prisma.debiturKredit.findUnique({
            where: { id },
            include: {
                nasabah: true,
                analysis: true,
                collaterals: {
                    include: { collateral: true },
                },
                fasilitas: true,
                realisasi: true,
                jadwal: {
                    orderBy: { angsuranKe: 'asc' }
                },
                transactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            },
        });
        if (!credit) throw new NotFoundException('Credit application not found');
        return credit;
    }
}
