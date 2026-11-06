export const PAYMENT_PLANS_KEY = 'payment_tracker_plans';
export const PAYMENT_HISTORY_KEY = 'payment_tracker_history';
export const PAYMENT_PREFERENCES_KEY = 'payment_tracker_preferences';
export const PAYMENT_BACKUP_FORMAT = 'my-purchase-fund.payment-tracker';
export const PAYMENT_BACKUP_VERSION = 1;
export const PAYMENT_CATEGORIES = ['Bills', 'Insurance', 'Memberships', 'Subscriptions', 'Education', 'Home', 'Other'];

export type PaymentFrequency = 'once' | 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';
export type PaymentPlan = {
  id: string; name: string; provider: string; category: string; totalPaise: number;
  installmentPaise: number; frequency: PaymentFrequency; startDate: string; endDate: string; createdAt: string;
};
export type PaymentRecord = {
  id: string; planId: string; installmentDate?: string; paymentDate: string; amountPaise: number;
  method?: string; reference?: string; notes?: string;
};
export type PaymentTrackerData = { plans: PaymentPlan[]; records: PaymentRecord[]; categories: string[]; preferences: Record<string, unknown> };
export type Installment = { id: string; planId: string; dueDate: string; amountPaise: number; paidPaise: number; status: 'paid'|'upcoming'|'due-today'|'overdue' };
const FREQUENCIES = new Set<PaymentFrequency>(['once','monthly','quarterly','half-yearly','yearly']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID = /^[\w-]{1,100}$/;

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function isValidLocalDate(value: unknown): value is string {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const [y,m,d] = value.split('-').map(Number);
  const date = new Date(y,m-1,d);
  return date.getFullYear()===y && date.getMonth()===m-1 && date.getDate()===d;
}
export function nextScheduleDate(startDate: string, monthOffset: number): string {
  const [year, month, day] = startDate.split('-').map(Number);
  const target = new Date(year, month-1+monthOffset, 1);
  const lastDay = new Date(target.getFullYear(), target.getMonth()+1, 0).getDate();
  return `${target.getFullYear()}-${String(target.getMonth()+1).padStart(2,'0')}-${String(Math.min(day,lastDay)).padStart(2,'0')}`;
}
export function validatePlan(plan: PaymentPlan): void {
  if (!SAFE_ID.test(plan.id) || !plan.name.trim() || !plan.provider.trim() || !plan.category.trim()) throw new Error('Each payment plan needs a valid ID, name, provider, and category.');
  if (!Number.isSafeInteger(plan.totalPaise) || plan.totalPaise <= 0 || !Number.isSafeInteger(plan.installmentPaise) || plan.installmentPaise <= 0) throw new Error('Plan and installment amounts must be positive whole paise amounts.');
  if (!FREQUENCIES.has(plan.frequency)) throw new Error('The payment frequency is not supported.');
  if (!isValidLocalDate(plan.startDate) || !isValidLocalDate(plan.endDate) || plan.endDate < plan.startDate) throw new Error('Plan dates must be valid local calendar dates, with the end date on or after the start date.');
  if (typeof plan.createdAt !== 'string' || !Number.isFinite(Date.parse(plan.createdAt))) throw new Error('The plan creation date is invalid.');
}
export function planPaidTotal(planId: string, records: PaymentRecord[]): number {
  return records.filter(record => record.planId === planId).reduce((sum, record) => sum + record.amountPaise, 0);
}
export function hasScheduleChanges(previous: PaymentPlan, next: PaymentPlan): boolean {
  return previous.totalPaise !== next.totalPaise || previous.installmentPaise !== next.installmentPaise || previous.frequency !== next.frequency || previous.startDate !== next.startDate || previous.endDate !== next.endDate;
}
export function validatePlanEdit(previous: PaymentPlan, next: PaymentPlan, records: PaymentRecord[]): boolean {
  validatePlan(next);
  if (next.id !== previous.id || next.createdAt !== previous.createdAt) throw new Error('Editing a plan cannot change its ID or creation date.');
  if (next.totalPaise < planPaidTotal(previous.id, records)) throw new Error('Total commitment cannot be less than payments already recorded.');
  return hasScheduleChanges(previous, next);
}
export function validatePaymentRecord(plan: PaymentPlan, payment: PaymentRecord, records: PaymentRecord[]): void {
  if (!SAFE_ID.test(payment.id) || payment.planId !== plan.id) throw new Error('The payment does not belong to this plan.');
  if (records.some(record => record.id === payment.id)) throw new Error('This payment has already been recorded.');
  if (!isValidLocalDate(payment.paymentDate) || (payment.installmentDate !== undefined && !isValidLocalDate(payment.installmentDate))) throw new Error('Payment dates must be valid local calendar dates.');
  if (!Number.isSafeInteger(payment.amountPaise) || payment.amountPaise <= 0) throw new Error('Enter a valid payment amount.');
  const alreadyPaid = planPaidTotal(plan.id, records);
  if (payment.amountPaise > plan.totalPaise - alreadyPaid) throw new Error('Payment exceeds the plan’s remaining commitment.');
  for (const field of ['method','reference','notes'] as const) if (payment[field] !== undefined && typeof payment[field] !== 'string') throw new Error(`Payment ${field} must be text.`);
}
export function validatePaymentData(data: PaymentTrackerData): PaymentTrackerData {
  if (!data || !Array.isArray(data.plans) || !Array.isArray(data.records) || !Array.isArray(data.categories) || !data.preferences || typeof data.preferences !== 'object' || Array.isArray(data.preferences)) throw new Error('Backup must include payment plans, payment records, categories, and preferences.');
  const ids = new Set<string>();
  data.plans.forEach(plan => { validatePlan(plan); if(ids.has(plan.id)) throw new Error('Backup contains duplicate payment plan IDs.'); ids.add(plan.id); });
  const categories = new Set(data.categories);
  if (data.categories.some(c => typeof c !== 'string' || !c.trim()) || categories.size !== data.categories.length) throw new Error('Backup categories must be nonempty unique names.');
  for (const plan of data.plans) if (!categories.has(plan.category)) throw new Error(`The category for “${plan.name}” is missing from the backup categories.`);
  const recordIds = new Set<string>(), paidByPlan = new Map<string, number>();
  data.records.forEach(record => {
    if (!record || !SAFE_ID.test(record.id) || recordIds.has(record.id)) throw new Error('Backup contains an invalid or duplicate payment record ID.');
    recordIds.add(record.id);
    if (!ids.has(record.planId)) throw new Error('A payment record refers to a plan that does not exist.');
    if ((record.installmentDate !== undefined && !isValidLocalDate(record.installmentDate)) || !isValidLocalDate(record.paymentDate)) throw new Error('Payment record dates must be valid local calendar dates.');
    if (!Number.isSafeInteger(record.amountPaise) || record.amountPaise <= 0) throw new Error('Payment record amounts must be positive whole paise amounts.');
    for (const field of ['method','reference','notes'] as const) if (record[field] !== undefined && typeof record[field] !== 'string') throw new Error(`Payment record ${field} must be text.`);
    paidByPlan.set(record.planId,(paidByPlan.get(record.planId)??0)+record.amountPaise);
  });
  for (const plan of data.plans) if ((paidByPlan.get(plan.id)??0) > plan.totalPaise) throw new Error(`Recorded payments exceed the commitment for “${plan.name}”.`);
  return { plans: data.plans, records: data.records, categories: data.categories, preferences: data.preferences };
}
export function parsePaymentBackup(raw: unknown): PaymentTrackerData {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('This file is not a Payment Tracker backup.');
  const backup = raw as Record<string, unknown>;
  if (backup.format !== PAYMENT_BACKUP_FORMAT) throw new Error('This file does not have the Payment Tracker backup format.');
  if (backup.version !== PAYMENT_BACKUP_VERSION) throw new Error(`Unsupported Payment Tracker backup version: ${String(backup.version)}.`);
  if (typeof backup.exportedAt !== 'string' || !Number.isFinite(Date.parse(backup.exportedAt))) throw new Error('Backup export timestamp is missing or invalid.');
  return validatePaymentData(backup.data as PaymentTrackerData);
}
export function sanitizeStoredPlans(raw: string | null): PaymentPlan[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(plan => { try { validatePlan(plan); return true; } catch { return false; } });
  } catch { return []; }
}
export function sanitizeStoredRecords(raw: string | null, plans: PaymentPlan[]): PaymentRecord[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw), planMap = new Map(plans.map(p=>[p.id,p]));
    if (!Array.isArray(value)) return [];
    const output:PaymentRecord[]=[],ids=new Set<string>(),paidByPlan=new Map<string,number>();
    for(const record of value){
      if(!record||typeof record!=='object'||typeof record.id!=='string'||ids.has(record.id)||typeof record.planId!=='string')continue;
      const plan=planMap.get(record.planId),amount=record.amountPaise;
      if(!plan||(record.installmentDate!==undefined&&!isValidLocalDate(record.installmentDate))||!isValidLocalDate(record.paymentDate)||!Number.isSafeInteger(amount)||amount<=0)continue;
      if(['method','reference','notes'].some(field=>record[field]!==undefined&&typeof record[field]!=='string'))continue;
      if((paidByPlan.get(plan.id)??0)+amount>plan.totalPaise)continue;
      output.push(record as PaymentRecord);ids.add(record.id);paidByPlan.set(plan.id,(paidByPlan.get(plan.id)??0)+amount);
    }
    return output;
  } catch { return []; }
}
export function scheduleForPlan(plan: PaymentPlan, records: PaymentRecord[], today = localDate()): Installment[] {
  const step = plan.frequency==='once'?0:plan.frequency==='monthly'?1:plan.frequency==='quarterly'?3:plan.frequency==='half-yearly'?6:12;
  const planRecords=records.filter(r=>r.planId===plan.id);
  const result: Installment[]=[]; let remaining=plan.totalPaise; let offset=0;
  while (remaining>0 && result.length<1200) {
    const dueDate=nextScheduleDate(plan.startDate,offset); if(dueDate>plan.endDate) break;
    const amountPaise=Math.min(plan.installmentPaise,remaining);
    result.push({id:`${plan.id}:${dueDate}`,planId:plan.id,dueDate,amountPaise,paidPaise:0,status:'upcoming'});
    remaining-=amountPaise;
    if(step===0) break; offset+=step;
  }
  const installmentsByDate=new Map(result.map(item=>[item.dueDate,item]));
  let unapplied=planRecords.filter(record=>!record.installmentDate||!installmentsByDate.has(record.installmentDate)).reduce((sum,record)=>sum+record.amountPaise,0);
  for(const installment of result){
    const linkedPaid=planRecords.filter(record=>record.installmentDate===installment.dueDate).reduce((sum,record)=>sum+record.amountPaise,0);
    const direct=Math.min(installment.amountPaise,linkedPaid);
    unapplied+=linkedPaid-direct;
    const extra=Math.min(installment.amountPaise-direct,unapplied);
    installment.paidPaise=direct+extra;
    unapplied-=extra;
    installment.status=installment.paidPaise>=installment.amountPaise?'paid':installment.dueDate<today?'overdue':installment.dueDate===today?'due-today':'upcoming';
  }
  return result;
}
