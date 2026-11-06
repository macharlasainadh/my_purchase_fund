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
  id: string; planId: string; installmentDate: string; paymentDate: string; amountPaise: number;
  method?: string; reference?: string; notes?: string;
};
export type PaymentTrackerData = { plans: PaymentPlan[]; records: PaymentRecord[]; categories: string[]; preferences: Record<string, unknown> };
export type Installment = { id: string; planId: string; dueDate: string; amountPaise: number; paidPaise: number; status: 'paid'|'upcoming'|'due-today'|'overdue' };
const FREQUENCIES = new Set<PaymentFrequency>(['once','monthly','quarterly','half-yearly','yearly']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const SAFE_ID = /^[\w-]{1,100}$/;
const DEMO_PLAN_IDS = new Set(['insurance','streaming','membership','service']);
const DEMO_RECORD_IDS = new Set(['p1','p2','p3','p4','u1','u2','u3']);

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
    const linkedPlan = data.plans.find(plan=>plan.id===record.planId)!;
    if (!isValidLocalDate(record.installmentDate) || !isValidLocalDate(record.paymentDate)) throw new Error('Payment record dates must be valid local calendar dates.');
    if (!isScheduledDate(linkedPlan,record.installmentDate)) throw new Error('A payment record refers to an installment date that is not in its plan schedule.');
    if (!Number.isSafeInteger(record.amountPaise) || record.amountPaise <= 0) throw new Error('Payment record amounts must be positive whole paise amounts.');
    for (const field of ['method','reference','notes'] as const) if (record[field] !== undefined && typeof record[field] !== 'string') throw new Error(`Payment record ${field} must be text.`);
    paidByPlan.set(record.planId,(paidByPlan.get(record.planId)??0)+record.amountPaise);
  });
  for (const plan of data.plans) if ((paidByPlan.get(plan.id)??0) > plan.totalPaise) throw new Error(`Recorded payments exceed the commitment for “${plan.name}”.`);
  const perInstallment = new Map<string,number>();
  data.records.forEach(record=>{const key=`${record.planId}:${record.installmentDate}`;perInstallment.set(key,(perInstallment.get(key)??0)+record.amountPaise);});
  for (const plan of data.plans) for (const installment of scheduleForPlan(plan,[],'0001-01-01')) if ((perInstallment.get(installment.id)??0)>installment.amountPaise) throw new Error(`Recorded payments exceed the scheduled installment for “${plan.name}”.`);
  return { plans: data.plans, records: data.records, categories: data.categories, preferences: data.preferences };
}
function isScheduledDate(plan:PaymentPlan,dueDate:string):boolean{
  if(dueDate<plan.startDate||dueDate>plan.endDate)return false;
  if(plan.frequency==='once')return dueDate===plan.startDate;
  const step=plan.frequency==='monthly'?1:plan.frequency==='quarterly'?3:plan.frequency==='half-yearly'?6:12;
  for(let offset=0;offset<=1200;offset+=step){const date=nextScheduleDate(plan.startDate,offset);if(date===dueDate)return true;if(date>dueDate||date>plan.endDate)break;}
  return false;
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
    // Remove the exact built-in examples from the first Payment Tracker release.
    return value.filter(plan => plan && typeof plan.id==='string' && !DEMO_PLAN_IDS.has(plan.id)).filter(plan => { try { validatePlan(plan); return true; } catch { return false; } });
  } catch { return []; }
}
export function sanitizeStoredRecords(raw: string | null, plans: PaymentPlan[]): PaymentRecord[] {
  if (!raw) return [];
  try {
    const value = JSON.parse(raw), planMap = new Map(plans.map(p=>[p.id,p]));
    if (!Array.isArray(value)) return [];
    const output:PaymentRecord[]=[],ids=new Set<string>(),paidByPlan=new Map<string,number>(),paidByInstallment=new Map<string,number>();
    for(const record of value){
      if(!record||typeof record!=='object'||typeof record.id!=='string'||DEMO_RECORD_IDS.has(record.id)||ids.has(record.id)||typeof record.planId!=='string')continue;
      const plan=planMap.get(record.planId),amount=record.amountPaise,key=`${record.planId}:${record.installmentDate}`;
      if(!plan||!isValidLocalDate(record.installmentDate)||!isValidLocalDate(record.paymentDate)||!Number.isSafeInteger(amount)||amount<=0||!isScheduledDate(plan,record.installmentDate))continue;
      if(['method','reference','notes'].some(field=>record[field]!==undefined&&typeof record[field]!=='string'))continue;
      const dueAmount=scheduleForPlan(plan,[], '0001-01-01').find(item=>item.id===key)?.amountPaise??0;
      if((paidByPlan.get(plan.id)??0)+amount>plan.totalPaise||(paidByInstallment.get(key)??0)+amount>dueAmount)continue;
      output.push(record as PaymentRecord);ids.add(record.id);paidByPlan.set(plan.id,(paidByPlan.get(plan.id)??0)+amount);paidByInstallment.set(key,(paidByInstallment.get(key)??0)+amount);
    }
    return output;
  } catch { return []; }
}
export function scheduleForPlan(plan: PaymentPlan, records: PaymentRecord[], today = localDate()): Installment[] {
  const step = plan.frequency==='once'?0:plan.frequency==='monthly'?1:plan.frequency==='quarterly'?3:plan.frequency==='half-yearly'?6:12;
  const collected = new Map<string,number>();
  records.filter(r=>r.planId===plan.id).forEach(r=>collected.set(r.installmentDate,(collected.get(r.installmentDate)??0)+r.amountPaise));
  const result: Installment[]=[]; let remaining=plan.totalPaise; let offset=0;
  while (remaining>0 && result.length<1200) {
    const dueDate=nextScheduleDate(plan.startDate,offset); if(dueDate>plan.endDate) break;
    const amountPaise=Math.min(plan.installmentPaise,remaining), paidPaise=Math.min(amountPaise,collected.get(dueDate)??0);
    const status: Installment['status']=paidPaise>=amountPaise?'paid':dueDate<today?'overdue':dueDate===today?'due-today':'upcoming';
    result.push({id:`${plan.id}:${dueDate}`,planId:plan.id,dueDate,amountPaise,paidPaise,status});
    if(step===0) break; offset+=step;
  }
  return result;
}
