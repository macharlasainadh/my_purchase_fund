import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PaymentTracker } from '../src/platform/PaymentTracker';
import { PAYMENT_BACKUP_FORMAT, PAYMENT_BACKUP_VERSION, PAYMENT_CATEGORIES, localDate, nextScheduleDate, parsePaymentBackup, sanitizeStoredPlans, scheduleForPlan, type PaymentPlan, type PaymentTrackerData } from '../src/platform/paymentTrackerData';

const plan=(overrides:Partial<PaymentPlan>={}):PaymentPlan=>({id:'plan-1',name:'Annual service',provider:'Provider',category:'Bills',totalPaise:30000,installmentPaise:10000,frequency:'monthly',startDate:'2024-01-31',endDate:'2024-04-30',createdAt:'2024-01-01T00:00:00.000Z',...overrides});

describe('Payment Tracker data and schedules',()=>{
  it('renders the empty overview without unresolved schedule references',()=>{
    const html=renderToString(React.createElement(PaymentTracker,{page:'overview',onNavigate:()=>{}}));
    expect(html).toContain('Start with your first plan');
    expect(html).toContain('₹0.00');
  });
  it('starts empty and strips the first release example records during migration',()=>{
    expect(sanitizeStoredPlans(null)).toEqual([]);
    expect(sanitizeStoredPlans(JSON.stringify([plan(),{...plan(),id:'insurance',name:'Annual insurance premium'}]))).toHaveLength(1);
  });
  it('keeps recurring dates local and clamps month ends, including leap years',()=>{
    expect(nextScheduleDate('2024-01-31',1)).toBe('2024-02-29');
    expect(nextScheduleDate('2024-01-31',2)).toBe('2024-03-31');
    expect(nextScheduleDate('2023-01-31',1)).toBe('2023-02-28');
    expect(nextScheduleDate('2024-02-29',12)).toBe('2025-02-28');
  });
  it('distinguishes upcoming, due today, overdue, and paid installments',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-04-01'});
    const records=[{id:'pay-1',planId:p.id,installmentDate:'2026-01-01',paymentDate:'2026-01-01',amountPaise:10000}];
    const schedule=scheduleForPlan(p,records,'2026-03-01');
    expect(schedule.map(i=>i.status)).toEqual(['paid','overdue','due-today','upcoming']);
    expect(schedule[0].paidPaise).toBe(10000);
  });
  it('rejects unsupported versions, wrong format, invalid dates and broken plan references',()=>{
    const data:PaymentTrackerData={plans:[plan()],records:[],categories:[...PAYMENT_CATEGORIES],preferences:{}};
    const backup={format:PAYMENT_BACKUP_FORMAT,version:PAYMENT_BACKUP_VERSION,exportedAt:'2026-01-01T00:00:00.000Z',data};
    expect(parsePaymentBackup(backup)).toEqual(data);
    expect(()=>parsePaymentBackup({...backup,format:'purchase-fund'})).toThrow(/format/i);
    expect(()=>parsePaymentBackup({...backup,version:2})).toThrow(/version/i);
    expect(()=>parsePaymentBackup({...backup,data:{...data,records:[{id:'r1',planId:'missing',installmentDate:'2024-01-31',paymentDate:'2024-01-31',amountPaise:500}]}})).toThrow(/refers to a plan/i);
  });
  it('does not allow exported payment records to exceed a scheduled installment',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-01-01',frequency:'once',totalPaise:10000,installmentPaise:10000});
    const data={plans:[p],records:[{id:'r1',planId:p.id,installmentDate:p.startDate,paymentDate:p.startDate,amountPaise:12000}],categories:[...PAYMENT_CATEGORIES],preferences:{}};
    expect(()=>parsePaymentBackup({format:PAYMENT_BACKUP_FORMAT,version:PAYMENT_BACKUP_VERSION,exportedAt:new Date().toISOString(),data})).toThrow(/exceed/i);
  });
  it('uses a local calendar date without UTC conversion',()=>{
    expect(localDate(new Date(2026,5,18,0,30))).toBe('2026-06-18');
  });
});
