import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { AccountingService } from '../accounting.service';

@Injectable()
export class AccountingListener {
  constructor(private accountingService: AccountingService) {}

  @OnEvent('transaction.created')
  async handleTransactionCreatedEvent(payload: {
    transType: string;
    amount: number;
    description: string;
    userId: number;
    refId?: number;
    wilayahCd?: string;
    branchCode?: string;
    useTransitAccount?: boolean;
  }) {
    console.log('Accounting Listener: Received transaction.created', payload);
    try {
      await this.accountingService.autoPostJournal(payload);
      console.log('Accounting Listener: Auto-posting successful');
    } catch (error) {
      console.error('Accounting Listener: Auto-posting failed', error.message);
      // Logic for retry or alert could go here
    }
  }
}
