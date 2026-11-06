import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PaymentTracker } from '../src/platform/PaymentTracker';
import { PAYMENT_BACKUP_FORMAT, PAYMENT_BACKUP_VERSION, PAYMENT_CATEGORIES, archivePlan, deletePlanWithoutPayments, filterTimelineItems, hasScheduleChanges, installmentIdFor, isPlanArchived, localDate, nextScheduleDate, parsePaymentBackup, planPaidTotal, restorePlan, sanitizeStoredPlans, sanitizeStoredRecords, scheduleForPlan, validatePaymentRecord, validatePlanEdit, type PaymentPlan, type PaymentRecord, type PaymentTrackerData } from '../src/platform/paymentTrackerData';

const plan=(overrides:Partial<PaymentPlan>={}):PaymentPlan=>({id:'plan-1',name:'Annual service',provider:'Provider',category:'Bills',totalPaise:30000,installmentPaise:10000,frequency:'monthly',startDate:'2024-01-31',endDate:'2024-04-30',createdAt:'2024-01-01T00:00:00.000Z',...overrides});
function renderWithStoredPlans(page:string,plans:PaymentPlan[],records:PaymentRecord[]=[]){const original=Object.getOwnPropertyDescriptor(globalThis,'localStorage');Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:(key:string)=>key==='payment_tracker_plans'?JSON.stringify(plans):key==='payment_tracker_history'?JSON.stringify(records):null}});try{return renderToString(React.createElement(PaymentTracker,{page,onNavigate:()=>{}}));}finally{if(original)Object.defineProperty(globalThis,'localStorage',original);else Reflect.deleteProperty(globalThis,'localStorage');}}

describe('Payment Tracker data and schedules',()=>{
  it('renders the empty overview without unresolved schedule references',()=>{
    const html=renderToString(React.createElement(PaymentTracker,{page:'overview',onNavigate:()=>{}}));
    expect(html).toContain('Start with your first plan');
    expect(html).toContain('₹0.00');
  });
  it('starts empty and preserves existing valid user records regardless of their IDs',()=>{
    expect(sanitizeStoredPlans(null)).toEqual([]);
    const storedPlans=sanitizeStoredPlans(JSON.stringify([plan(),{...plan(),id:'insurance',name:'Annual insurance premium'}]));
    expect(storedPlans).toHaveLength(2);
    const legacyNamedRecord:PaymentRecord={id:'p1',planId:'insurance',installmentDate:'2024-01-31',paymentDate:'2024-02-01',amountPaise:1000};
    expect(sanitizeStoredRecords(JSON.stringify([legacyNamedRecord]),storedPlans)).toEqual([legacyNamedRecord]);
  });
  it('keeps recurring dates local and clamps month ends, including leap years',()=>{
    expect(nextScheduleDate('2024-01-31',1)).toBe('2024-02-29');
    expect(nextScheduleDate('2024-01-31',2)).toBe('2024-03-31');
    expect(nextScheduleDate('2023-01-31',1)).toBe('2023-02-28');
    expect(nextScheduleDate('2024-02-29',12)).toBe('2025-02-28');
  });
  it('distinguishes upcoming, due today, overdue, and paid installments',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-04-01',totalPaise:40000});
    const records=[{id:'pay-1',planId:p.id,installmentDate:'2026-01-01',paymentDate:'2026-01-01',amountPaise:10000}];
    const schedule=scheduleForPlan(p,records,'2026-03-01');
    expect(schedule.map(i=>i.status)).toEqual(['paid','overdue','due-today','upcoming']);
    expect(schedule[0].paidPaise).toBe(10000);
    expect(schedule).toHaveLength(4);
  });
  it('rejects unsupported versions, wrong format, invalid dates and broken plan references',()=>{
    const data:PaymentTrackerData={plans:[plan()],records:[],categories:[...PAYMENT_CATEGORIES],preferences:{}};
    const backup={format:PAYMENT_BACKUP_FORMAT,version:PAYMENT_BACKUP_VERSION,exportedAt:'2026-01-01T00:00:00.000Z',data};
    expect(parsePaymentBackup(backup)).toEqual(data);
    expect(()=>parsePaymentBackup({...backup,format:'purchase-fund'})).toThrow(/format/i);
    expect(()=>parsePaymentBackup({...backup,version:2})).toThrow(/version/i);
    expect(()=>parsePaymentBackup({...backup,data:{...data,records:[{id:'r1',planId:'missing',installmentDate:'2024-01-31',paymentDate:'2024-01-31',amountPaise:500}]}})).toThrow(/refers to a plan/i);
  });
  it('does not allow exported payment records to exceed the plan commitment',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-01-01',frequency:'once',totalPaise:10000,installmentPaise:10000});
    const data={plans:[p],records:[{id:'r1',planId:p.id,installmentDate:p.startDate,paymentDate:p.startDate,amountPaise:12000}],categories:[...PAYMENT_CATEGORIES],preferences:{}};
    expect(()=>parsePaymentBackup({format:PAYMENT_BACKUP_FORMAT,version:PAYMENT_BACKUP_VERSION,exportedAt:new Date().toISOString(),data})).toThrow(/exceed/i);
  });
  it('uses a local calendar date without UTC conversion',()=>{
    expect(localDate(new Date(2026,5,18,0,30))).toBe('2026-06-18');
  });
  it('allows partial and multiple payments for one installment and completes it only at zero balance',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-04-01',totalPaise:40000});
    const first:PaymentRecord={id:'payment-1',planId:p.id,installmentDate:'2026-01-01',paymentDate:'2026-01-02',amountPaise:4000};
    const second:PaymentRecord={id:'payment-2',planId:p.id,installmentDate:'2026-01-01',paymentDate:'2026-01-03',amountPaise:3500};
    validatePaymentRecord(p,first,[]);
    validatePaymentRecord(p,second,[first]);
    expect(scheduleForPlan(p,[first,second],'2026-01-04')[0]).toMatchObject({paidPaise:7500,status:'overdue'});
    const final:PaymentRecord={id:'payment-3',planId:p.id,installmentDate:'2026-01-01',paymentDate:'2026-01-04',amountPaise:2500};
    validatePaymentRecord(p,final,[first,second]);
    expect(scheduleForPlan(p,[first,second,final],'2026-01-04')[0]).toMatchObject({paidPaise:10000,status:'paid'});
    const additional:PaymentRecord={id:'payment-4',planId:p.id,installmentDate:'2026-01-01',paymentDate:'2026-01-05',amountPaise:2500};
    expect(()=>validatePaymentRecord(p,additional,[first,second,final])).toThrow(/selected installment/i);
    const nextInstallment:PaymentRecord={id:'payment-5',planId:p.id,installmentDate:'2026-02-01',paymentDate:'2026-01-05',amountPaise:2500};
    validatePaymentRecord(p,nextInstallment,[first,second,final]);
    expect(scheduleForPlan(p,[first,second,final,nextInstallment],'2026-01-05').map(i=>i.paidPaise)).toEqual([10000,2500,0,0]);
  });
  it('prevents duplicate transaction IDs and records only the remaining amount for a partial installment',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-01-01',frequency:'once',totalPaise:10000,installmentPaise:10000});
    const partial:PaymentRecord={id:'payment-1',planId:p.id,installmentDate:p.startDate,paymentDate:'2026-01-02',amountPaise:3500};
    expect(()=>validatePaymentRecord(p,partial,[partial])).toThrow(/already been recorded/i);
    const remainder:PaymentRecord={id:'payment-2',planId:p.id,installmentDate:p.startDate,paymentDate:'2026-01-03',amountPaise:6500};
    validatePaymentRecord(p,remainder,[partial]);
    expect(scheduleForPlan(p,[partial,remainder],'2026-01-03')[0]).toMatchObject({paidPaise:10000,status:'paid'});
    expect(planPaidTotal(p.id,[partial,remainder])).toBe(10000);
  });
  it('keeps unassigned payments out of scheduled installments while retaining plan totals',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-03-01'});
    const payment:PaymentRecord={id:'payment-1',planId:p.id,paymentDate:'2026-01-02',amountPaise:12000};
    validatePaymentRecord(p,payment,[]);
    expect(planPaidTotal(p.id,[payment])).toBe(12000);
    expect(scheduleForPlan(p,[payment],'2026-01-03').map(i=>[i.paidPaise,i.status])).toEqual([[0,'overdue'],[0,'upcoming'],[0,'upcoming']]);
    expect(()=>validatePaymentRecord(p,{...payment,id:'payment-2',amountPaise:18001},[payment])).toThrow(/remaining commitment/i);
  });
  it('applies payments only to their explicit installment association and prevents over-allocation',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-04-01',totalPaise:40000});
    const records:PaymentRecord[]=[
      {id:'unassigned',planId:p.id,paymentDate:'2026-01-01',amountPaise:10000},
      {id:'jan',planId:p.id,installmentDate:'2026-01-01',installmentId:installmentIdFor(p.id,'2026-01-01'),paymentDate:'2026-01-02',amountPaise:6000},
      {id:'feb',planId:p.id,installmentDate:'2026-02-01',installmentId:installmentIdFor(p.id,'2026-02-01'),paymentDate:'2026-02-02',amountPaise:10000},
    ];
    const schedule=scheduleForPlan(p,records,'2026-02-03');
    expect(schedule.map(i=>[i.paidPaise,i.status])).toEqual([[6000,'overdue'],[10000,'paid'],[0,'upcoming'],[0,'upcoming']]);
    expect(planPaidTotal(p.id,records)).toBe(26000);
    expect(()=>validatePaymentRecord(p,{id:'too-much',planId:p.id,installmentDate:'2026-01-01',installmentId:installmentIdFor(p.id,'2026-01-01'),paymentDate:'2026-02-03',amountPaise:4001},records)).toThrow(/selected installment/i);
  });
  it('filters timeline statuses without duplicating or reordering schedule entries',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-04-01',totalPaise:40000});
    const items=scheduleForPlan(p,[{id:'paid',planId:p.id,installmentDate:'2026-01-01',paymentDate:'2026-01-01',amountPaise:10000}],'2026-03-01');
    expect(filterTimelineItems(items,'all')).toEqual(items);
    expect(filterTimelineItems(items,'paid').map(i=>i.dueDate)).toEqual(['2026-01-01']);
    expect(filterTimelineItems(items,'upcoming').map(i=>i.status)).toEqual(['due-today','upcoming']);
    expect(filterTimelineItems(items,'overdue').map(i=>i.status)).toEqual(['overdue']);
    expect(new Set(items.map(i=>i.id)).size).toBe(items.length);
  });
  it('includes Investment and restores older backups without changing their shape',()=>{
    expect(PAYMENT_CATEGORIES).toContain('Investment');
    const p=plan();
    const oldData:PaymentTrackerData={plans:[p],records:[{id:'legacy',planId:p.id,paymentDate:'2024-01-31',amountPaise:1000}],categories:['Bills'],preferences:{}};
    const restored=parsePaymentBackup({format:PAYMENT_BACKUP_FORMAT,version:1,exportedAt:'2024-02-01T00:00:00.000Z',data:oldData});
    expect(restored).toEqual(oldData);
    const investmentRecord:PaymentRecord={id:'investment-payment',planId:p.id,paymentDate:'2024-02-01',amountPaise:1000,category:'Investment'};
    expect(()=>validatePaymentRecord(p,investmentRecord,[oldData.records[0]])).not.toThrow();
  });
  it('archives and restores plan metadata without changing schedule or payment history',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-03-01'});
    const archived=archivePlan(p,'2026-02-01T12:00:00.000Z');
    const payment:PaymentRecord={id:'kept-payment',planId:p.id,installmentDate:'2026-01-01',installmentId:installmentIdFor(p.id,'2026-01-01'),paymentDate:'2026-01-02',amountPaise:5000,method:'Bank transfer',reference:'ref-42',notes:'retain'};
    expect(isPlanArchived(archived)).toBe(true);
    expect(scheduleForPlan(archived,[payment],'2026-02-02')).toEqual(scheduleForPlan(p,[payment],'2026-02-02'));
    const restored=restorePlan(archived);
    expect(restored).toEqual(p);
    expect(isPlanArchived(restored)).toBe(false);
    expect(payment).toMatchObject({installmentId:installmentIdFor(p.id,'2026-01-01'),method:'Bank transfer',reference:'ref-42',notes:'retain'});
    const data:PaymentTrackerData={plans:[archived],records:[payment],categories:[...PAYMENT_CATEGORIES],preferences:{}};
    const backup=parsePaymentBackup({format:PAYMENT_BACKUP_FORMAT,version:1,exportedAt:'2026-02-02T00:00:00.000Z',data});
    expect(backup.plans[0].archivedAt).toBe(archived.archivedAt);
    expect(backup.records).toEqual([payment]);
  });
  it('permits permanent deletion only when there is no payment history',()=>{
    const first=plan(),second=plan({id:'plan-2',name:'Another plan'});
    const payment:PaymentRecord={id:'history',planId:first.id,paymentDate:'2026-01-01',amountPaise:1000};
    expect(()=>deletePlanWithoutPayments(first.id,[first,second],[payment])).toThrow(/must be archived/i);
    expect(deletePlanWithoutPayments(second.id,[first,second],[payment])).toEqual([first]);
    expect(payment.planId).toBe(first.id);
  });
  it('shows archived plans separately and offers restore without payment actions',()=>{
    const archived=archivePlan(plan({startDate:'2026-01-01',endDate:'2026-02-01'}),'2026-02-02T00:00:00.000Z');
    const payment:PaymentRecord={id:'archived-payment',planId:archived.id,installmentDate:'2026-01-01',installmentId:installmentIdFor(archived.id,'2026-01-01'),paymentDate:'2026-01-02',amountPaise:10000,method:'Card'};
    const html=renderWithStoredPlans('plans',[archived],[payment]);
    expect(html).toContain('Archived Plans');
    expect(html).toContain('history retained');
    expect(html).toContain('Restore');
    const details=renderWithStoredPlans(`detail-${archived.id}`,[archived],[payment]);
    expect(details).toContain('This plan is archived');
    expect(details).toContain('Restore plan');
    expect(details).not.toContain('Record payment');
    expect(details).not.toContain('Delete plan');
    expect(details).toContain('Card');
  });
  it('validates plan edits without changing existing transaction records',()=>{
    const current=plan({startDate:'2026-01-01',endDate:'2026-03-01'});
    const record:PaymentRecord={id:'payment-1',planId:current.id,installmentDate:'2026-01-01',paymentDate:'2026-01-02',amountPaise:4000};
    const edited={...current,name:'Updated service'};
    expect(validatePlanEdit(current,edited,[record])).toBe(false);
    const scheduleEdit={...edited,installmentPaise:15000};
    expect(hasScheduleChanges(current,scheduleEdit)).toBe(true);
    expect(validatePlanEdit(current,scheduleEdit,[record])).toBe(true);
    expect(record).toEqual({id:'payment-1',planId:current.id,installmentDate:'2026-01-01',paymentDate:'2026-01-02',amountPaise:4000});
    expect(()=>validatePlanEdit(current,{...scheduleEdit,totalPaise:3999},[record])).toThrow(/less than payments already recorded/i);
  });
  it('recalculates balances and timeline status when a payment is edited or removed',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-02-01'});
    const payment:PaymentRecord={id:'payment-1',planId:p.id,installmentDate:'2026-01-01',paymentDate:'2026-01-02',amountPaise:10000};
    const edited={...payment,amountPaise:5000};
    expect(scheduleForPlan(p,[payment],'2026-01-03')[0].status).toBe('paid');
    expect(planPaidTotal(p.id,[edited])).toBe(5000);
    expect(scheduleForPlan(p,[edited],'2026-01-03')[0]).toMatchObject({paidPaise:5000,status:'overdue'});
    expect(scheduleForPlan(p,[],'2026-01-03')[0]).toMatchObject({paidPaise:0,status:'overdue'});
  });
  it('restores the existing version 1 backup shape and accepts optional installment links',()=>{
    const p=plan({startDate:'2026-01-01',endDate:'2026-01-01',frequency:'once',totalPaise:10000,installmentPaise:10000});
    const data:PaymentTrackerData={plans:[p],records:[{id:'payment-1',planId:p.id,paymentDate:'2026-01-02',amountPaise:5000}],categories:[...PAYMENT_CATEGORIES],preferences:{}};
    const restored=parsePaymentBackup({format:PAYMENT_BACKUP_FORMAT,version:1,exportedAt:'2026-01-03T00:00:00.000Z',data});
    expect(restored).toEqual(data);
    expect(scheduleForPlan(p,restored.records,'2026-01-03')[0]).toMatchObject({paidPaise:0,status:'overdue'});
  });
});
