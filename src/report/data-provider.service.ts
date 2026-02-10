import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

/**
 * Data Provider Service
 * Fetches and formats data from database for report generation
 */
@Injectable()
export class DataProviderService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get data for a specific product and record
   */
  async getReportData(
    productModule: string,
    recordId?: string,
    parameters?: Record<string, any>,
  ): Promise<Record<string, any>> {
    const module = productModule.toUpperCase();

    switch (module) {
      case 'SIMPANAN':
        return this.getSimpananData(recordId, parameters);
      case 'KREDIT':
        return this.getKreditData(recordId, parameters);
      case 'ANGGOTA':
        return this.getAnggotaData(recordId, parameters);
      case 'ACCOUNTING':
        return this.getAccountingData(parameters);
      case 'DEPOSITO':
        return this.getDepositoData(recordId, parameters);
      default:
        return this.getGenericData(module, recordId, parameters);
    }
  }

  /**
   * Get Simpanan (Savings) data
   */
  private async getSimpananData(
    accountNo?: string,
    parameters?: Record<string, any>,
  ): Promise<Record<string, any>> {
    const data: Record<string, any> = {
      // Header data
      nama_instansi: 'Koperasi Krama Bali',
      alamat: 'Jl. Raya Denpasar',
      tanggal: this.formatDate(new Date()),
      kabupaten: parameters?.regionCode || 'DENPASAR',
    };

    if (accountNo) {
      // Get specific account data
      const account = await this.prisma.nasabahTab.findUnique({
        where: { noTab: accountNo },
        include: {
          nasabah: true,
          transactions: {
            where: parameters?.startDate
              ? {
                  createdAt: {
                    gte: new Date(parameters.startDate),
                    lte: new Date(parameters.endDate || new Date()),
                  },
                }
              : undefined,
            orderBy: { createdAt: 'asc' },
            take: 100, // Limit for performance
          },
        },
      });

      if (account) {
        data.no_rek = account.noTab;
        data.nama = account.nasabah.nama;
        data.alamat = account.nasabah.alamat;
        data.tgl_lahir = this.formatDate(account.nasabah.tanggalLahir);
        data.tgl_daftar = this.formatDate(account.tglBuka);
        data.saldo = this.formatCurrency(account.saldo);

        // Transaction loop data
        data.transactions = account.transactions.map((trans, index) => ({
          no: index + 1,
          tgl: this.formatDate(trans.createdAt),
          kode: trans.tipeTrans,
          transaksi: trans.keterangan || trans.tipeTrans,
          debet:
            trans.tipeTrans === 'TARIK'
              ? this.formatCurrency(trans.nominal)
              : '',
          kredit:
            trans.tipeTrans === 'SETOR'
              ? this.formatCurrency(trans.nominal)
              : '',
          saldo: this.formatCurrency(trans.saldoAkhir),
        }));
      }
    } else {
      // Get list of accounts
      const accounts = await this.prisma.nasabahTab.findMany({
        where: {
          status: 'A',
          ...(parameters?.startDate && {
            tglBuka: {
              gte: new Date(parameters.startDate),
              lte: new Date(parameters.endDate || new Date()),
            },
          }),
        },
        include: {
          nasabah: true,
        },
        take: 100,
        orderBy: { noTab: 'asc' },
      });

      data.accounts = accounts.map((acc, index) => ({
        no: index + 1,
        tanggal: this.formatDate(acc.tglBuka),
        no_rek: acc.noTab,
        nama: acc.nasabah.nama,
        alamat: acc.nasabah.alamat,
        saldo: this.formatCurrency(acc.saldo),
        tgl_lahir: this.formatDate(acc.nasabah.tanggalLahir),
      }));
    }

    return data;
  }

  /**
   * Get Kredit (Credit) data
   */
  private async getKreditData(
    creditId?: string,
    parameters?: Record<string, any>,
  ): Promise<Record<string, any>> {
    const data: Record<string, any> = {
      nama_instansi: 'Koperasi Krama Bali',
      tanggal: this.formatDate(new Date()),
      kabupaten: parameters?.regionCode || 'DENPASAR',
    };

    if (creditId) {
      const credit = await this.prisma.debiturKredit.findFirst({
        where: {
          OR: [{ id: parseInt(creditId) }, { nomorKredit: creditId }],
        },
        include: {
          nasabah: true,
          fasilitas: true,
          realisasi: true,
          transactions: {
            orderBy: { createdAt: 'asc' },
            take: 100,
          },
        },
      });

      if (credit) {
        data.no_permohonan = credit.nomorKredit || credit.id.toString();
        data.nama = credit.nasabah.nama;
        data.alamat = credit.nasabah.alamat;
        data.tmp_lahir = credit.nasabah.tempatLahir;
        data.tgl_lahir = this.formatDate(credit.nasabah.tanggalLahir);
        data.nik = credit.nasabah.noKtp;
        data.pekerjaan = credit.nasabah.pekerjaan;
        data.telp = credit.nasabah.telepon;
        data.mohon_kredit = this.formatCurrency(credit.nominalPengajuan);
        data.terbilang = this.numberToWords(credit.nominalPengajuan);
        data.tujuan_permohonan = credit.tujuanKredit;

        if (credit.fasilitas.length > 0) {
          const fasilitas = credit.fasilitas[0];
          data.mohon_jangka_waktu = `${fasilitas.jangkaWaktu} bulan`;
          data.mohon_suku_bunga = `${fasilitas.bunga}%`;
          data.angsuran_pokok = this.formatCurrency(fasilitas.angsuranPokok);
          data.angsuran_bunga = this.formatCurrency(fasilitas.angsuranBunga);
        }

        // Transaction loop for K04 (Kartu Pinjaman)
        data.transactions = credit.transactions.map((trans) => ({
          tanggal: this.formatDate(trans.createdAt),
          kode_transaksi: trans.tipeTrans,
          angsuran_pokok: trans.tipeTrans.includes('ANGSUR')
            ? this.formatCurrency(trans.nominal)
            : '',
          angsuran_bunga: '',
          denda: '',
          sisa_pinjaman: '',
        }));
      }
    }

    return data;
  }

  /**
   * Get Anggota (Member) data
   */
  private async getAnggotaData(
    accountNo?: string,
    parameters?: Record<string, any>,
  ): Promise<Record<string, any>> {
    const data: Record<string, any> = {
      nama_instansi: 'Koperasi Krama Bali',
      tanggal: this.formatDate(new Date()),
    };

    if (accountNo) {
      const account = await this.prisma.anggotaAccount.findUnique({
        where: { accountNumber: accountNo },
        include: {
          customer: true,
          transactions: {
            orderBy: { transDate: 'asc' },
            take: 100,
          },
        },
      });

      if (account) {
        data.no_anggota = account.accountNumber;
        data.nama = account.customer.nama;
        data.alamat = account.customer.alamat;
        data.tlp = account.customer.telepon;
        data.pokok = this.formatCurrency(account.principal);
        data.wajib_awal = this.formatCurrency(account.mandatoryInit);
        data.saldo = this.formatCurrency(account.balance);

        data.transactions = account.transactions.map((trans) => ({
          tgl: this.formatDate(trans.transDate),
          kode: trans.transType,
          debet: trans.transType.includes('TARIK')
            ? this.formatCurrency(trans.amount)
            : '',
          kredit: trans.transType.includes('SETOR')
            ? this.formatCurrency(trans.amount)
            : '',
          saldo: this.formatCurrency(trans.balanceAfter),
        }));
      }
    } else {
      const accounts = await this.prisma.anggotaAccount.findMany({
        where: { isActive: true },
        include: { customer: true },
        take: 100,
        orderBy: { accountNumber: 'asc' },
      });

      data.accounts = accounts.map((acc, index) => ({
        no: index + 1,
        no_anggota: acc.accountNumber,
        nama: acc.customer.nama,
        alamat: acc.customer.alamat,
        tlp: acc.customer.telepon,
        pokok: this.formatCurrency(acc.principal),
        wajib: this.formatCurrency(acc.mandatoryInit),
        saldo: this.formatCurrency(acc.balance),
      }));
    }

    return data;
  }

  /**
   * Get Accounting data
   */
  private async getAccountingData(
    parameters?: Record<string, any>,
  ): Promise<Record<string, any>> {
    const data: Record<string, any> = {
      nama_instansi: 'Koperasi Krama Bali',
      tanggal: this.formatDate(new Date()),
    };

    // Get journal accounts for Neraca, Laba Rugi, etc.
    if (
      parameters?.reportType === 'NERACA' ||
      parameters?.reportType === 'AK80a'
    ) {
      const accounts = await this.prisma.journalAccount.findMany({
        where: { isActive: true },
        orderBy: { accountCode: 'asc' },
      });

      const aktiva = accounts.filter((acc) => acc.accountType === 'AST');
      const pasiva = accounts.filter(
        (acc) => acc.accountType === 'LIA' || acc.accountType === 'EQT',
      );

      data.aktiva = aktiva.map((acc) => ({
        KODE_PERKIRAAN: acc.accountCode,
        NAMA_PERKIRAAN: acc.accountName,
        DEBET: '0',
        KREDIT: '0',
      }));

      data.pasiva = pasiva.map((acc) => ({
        KODE_PERKIRAAN: acc.accountCode,
        NAMA_PERKIRAAN: acc.accountName,
        DEBET: '0',
        KREDIT: '0',
      }));
    }

    return data;
  }

  /**
   * Get Deposito data
   */
  private async getDepositoData(
    accountNo?: string,
    parameters?: Record<string, any>,
  ): Promise<Record<string, any>> {
    const data: Record<string, any> = {
      nama_instansi: 'Koperasi Krama Bali',
      tanggal: this.formatDate(new Date()),
    };

    if (accountNo) {
      const deposito = await this.prisma.nasabahJangka.findUnique({
        where: { noJangka: accountNo },
        include: { nasabah: true },
      });

      if (deposito) {
        data.nomor_bilyet = deposito.noJangka;
        data.nama_nasabah = deposito.nasabah.nama;
        data.alamat = deposito.nasabah.alamat;
        data.nominal = this.formatCurrency(deposito.nominal);
        data.nominal_terbilang = this.numberToWords(deposito.nominal);
        data.jangka_waktu = '12 bulan'; // Calculate from dates
        data.bunga_persen = `${deposito.bunga}%`;
        data.tanggal_mulai = this.formatDate(deposito.tglBuka);
        data.tanggal_jatuh_tempo = this.formatDate(deposito.tglJatuhTempo);
        data.perpanjangan_otomatis =
          deposito.payoutMode === 'ROLLOVER' ? 'YA' : 'TIDAK';
      }
    }

    return data;
  }

  /**
   * Generic data provider for unknown modules
   */
  private async getGenericData(
    module: string,
    recordId?: string,
    parameters?: Record<string, any>,
  ): Promise<Record<string, any>> {
    return {
      nama_instansi: 'Koperasi Krama Bali',
      tanggal: this.formatDate(new Date()),
      module,
      recordId,
      parameters,
    };
  }

  /**
   * Format date to Indonesian format (DD-MM-YYYY)
   */
  private formatDate(date: Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  /**
   * Format number as Indonesian currency
   */
  private formatCurrency(value: any): string {
    if (!value) return 'Rp 0';
    const num =
      typeof value === 'number' ? value : parseFloat(value.toString());
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  }

  /**
   * Convert number to Indonesian words (simplified)
   */
  private numberToWords(value: any): string {
    // Simplified implementation - just return formatted number for now
    // TODO: Implement full Indonesian number-to-words conversion
    return this.formatCurrency(value);
  }
}
