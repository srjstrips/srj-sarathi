import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { now } from '../common/utils/temporal.js';
import { v4 as uuidv4 } from 'uuid';
import {
  CheckInDto, CheckOutDto, AttendanceQueryDto, RegularizationRequestDto,
  ReviewRegularizationDto, CreateShiftDto, AssignShiftDto, CreateHolidayDto,
} from './dto/attendance.dto.js';

@Injectable()
export class AttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Attendance ───────────────────────────────────────────────────────────

  async list(query: AttendanceQueryDto) {
    const where: Record<string, unknown> = {};
    if (query.employeeId) where['employeeId'] = query.employeeId;
    if (query.status)     where['status']     = query.status;

    const page  = parseInt(query.page  ?? '1',  10);
    const limit = parseInt(query.limit ?? '31', 10);
    const skip  = (page - 1) * limit;

    const items = await this.prisma.orm.public.Attendance
      .where(where as any)
      .orderBy(m => (m as any).date.desc())
      .offset(skip)
      .limit(limit)
      .all();

    const { n: _n1 } = await this.prisma.orm.public.Attendance.where(where as any).aggregate(agg => ({ n: agg.count() }));
    const total = Number(_n1);
    return { items, total, page, limit };
  }

  async checkIn(employeeId: string, dto: CheckInDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await this.prisma.orm.public.Attendance
      .where({ employeeId, date: today } as any)
      .first();

    if (existing && (existing as any).checkIn) {
      throw new BadRequestException('Already checked in today');
    }

    const checkInTime = dto.checkIn ? new Date(dto.checkIn) : new Date();

    if (existing) {
      await this.prisma.orm.public.Attendance
        .where({ id: (existing as any).id } as any)
        .update({ checkIn: checkInTime as any, status: 'PRESENT' as any, updatedAt: now() as any } as any);
      return this.prisma.orm.public.Attendance.where({ id: (existing as any).id } as any).first();
    }

    return this.prisma.orm.public.Attendance.create({
      id:         uuidv4(),
      employeeId,
      date:       today as any,
      checkIn:    checkInTime as any,
      status:     'PRESENT' as any,
      remarks:    dto.remarks ?? null,
      createdAt:  now() as any,
      updatedAt:  now() as any,
    } as any);
  }

  async checkOut(employeeId: string, dto: CheckOutDto) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await this.prisma.orm.public.Attendance
      .where({ employeeId, date: today } as any)
      .first();

    if (!record || !(record as any).checkIn) {
      throw new BadRequestException('No check-in found for today');
    }

    const checkOutTime = dto.checkOut ? new Date(dto.checkOut) : new Date();
    const rawCheckIn = (record as any).checkIn;
    const checkInMs = rawCheckIn?.epochMilliseconds ?? new Date(String(rawCheckIn)).getTime();
    const workingHours = (checkOutTime.getTime() - checkInMs) / 3600000;

    await this.prisma.orm.public.Attendance
      .where({ id: (record as any).id } as any)
      .update({ checkOut: checkOutTime as any, workingHours: workingHours as any, updatedAt: now() as any } as any);

    return this.prisma.orm.public.Attendance.where({ id: (record as any).id } as any).first();
  }

  async getMonthlyReport(employeeId: string, year: number, month: number) {
    const fromDate = new Date(year, month - 1, 1);
    const toDate   = new Date(year, month,     0);

    const all = await this.prisma.orm.public.Attendance
      .where({ employeeId } as any)
      .orderBy(m => (m as any).date.asc())
      .all();

    return all.filter((r: any) => {
      const rawDate = r.date;
      const ms = rawDate?.epochMilliseconds ?? new Date(String(rawDate)).getTime();
      return ms >= fromDate.getTime() && ms <= toDate.getTime();
    });
  }

  // ─── Regularization ───────────────────────────────────────────────────────

  async requestRegularization(employeeId: string, dto: RegularizationRequestDto) {
    const record = await this.prisma.orm.public.Attendance.where({ id: dto.attendanceId } as any).first();
    if (!record) throw new NotFoundException('Attendance record not found');
    if ((record as any).employeeId !== employeeId) throw new BadRequestException('Not your attendance record');

    const existing = await this.prisma.orm.public.AttendanceRegularization
      .where({ attendanceId: dto.attendanceId } as any)
      .first();
    if (existing) throw new BadRequestException('Regularization already requested for this record');

    return this.prisma.orm.public.AttendanceRegularization.create({
      id:           uuidv4(),
      attendanceId: dto.attendanceId,
      employeeId,
      reason:       dto.reason as any,
      requestedIn:  dto.requestedIn  ? new Date(dto.requestedIn)  as any : null,
      requestedOut: dto.requestedOut ? new Date(dto.requestedOut) as any : null,
      status:       'PENDING' as any,
      createdAt:    now() as any,
      updatedAt:    now() as any,
    } as any);
  }

  async reviewRegularization(id: string, reviewedById: string, dto: ReviewRegularizationDto) {
    const reg = await this.prisma.orm.public.AttendanceRegularization.where({ id } as any).first();
    if (!reg) throw new NotFoundException('Regularization request not found');

    await this.prisma.orm.public.AttendanceRegularization
      .where({ id } as any)
      .update({
        status:       dto.status as any,
        reviewedById,
        reviewedAt:   now() as any,
        reviewNote:   dto.reviewNote ?? null,
        updatedAt:    now() as any,
      } as any);

    if (dto.status === 'APPROVED') {
      const updates: Record<string, unknown> = { isRegularized: true, updatedAt: now() as any };
      if ((reg as any).requestedIn)  updates['checkIn']  = (reg as any).requestedIn;
      if ((reg as any).requestedOut) updates['checkOut'] = (reg as any).requestedOut;
      await this.prisma.orm.public.Attendance
        .where({ id: (reg as any).attendanceId } as any)
        .update(updates as any);
    }

    return this.prisma.orm.public.AttendanceRegularization.where({ id } as any).first();
  }

  async listRegularizations(query: { employeeId?: string; status?: string; page?: string; limit?: string }) {
    const where: Record<string, unknown> = {};
    if (query.employeeId) where['employeeId'] = query.employeeId;
    if (query.status)     where['status']     = query.status;

    const page  = parseInt(query.page  ?? '1',  10);
    const limit = parseInt(query.limit ?? '20', 10);
    const skip  = (page - 1) * limit;

    const items = await this.prisma.orm.public.AttendanceRegularization
      .where(where as any)
      .orderBy(m => (m as any).createdAt.desc())
      .offset(skip)
      .limit(limit)
      .all();

    const { n: _n2 } = await this.prisma.orm.public.AttendanceRegularization.where(where as any).aggregate(agg => ({ n: agg.count() }));
    const total = Number(_n2);
    return { items, total, page, limit };
  }

  // ─── Shifts ───────────────────────────────────────────────────────────────

  async listShifts() {
    return this.prisma.orm.public.Shift.where({ isActive: true } as any).all();
  }

  async createShift(dto: CreateShiftDto) {
    const exists = await this.prisma.orm.public.Shift.where({ code: dto.code } as any).first();
    if (exists) throw new BadRequestException(`Shift code '${dto.code}' already exists`);
    return this.prisma.orm.public.Shift.create({
      id:           uuidv4(),
      code:         dto.code as any,
      name:         dto.name as any,
      startTime:    dto.startTime as any,
      endTime:      dto.endTime as any,
      graceMinutes: dto.graceMinutes ?? 0,
      isNightShift: dto.isNightShift ?? false,
      isActive:     true,
      createdAt:    now() as any,
      updatedAt:    now() as any,
    } as any);
  }

  async assignShift(dto: AssignShiftDto) {
    return this.prisma.orm.public.ShiftAssignment.create({
      id:         uuidv4(),
      employeeId: dto.employeeId,
      shiftId:    dto.shiftId,
      fromDate:   new Date(dto.fromDate) as any,
      toDate:     dto.toDate ? new Date(dto.toDate) as any : null,
      createdAt:  now() as any,
    } as any);
  }

  // ─── Holidays ─────────────────────────────────────────────────────────────

  async listHolidays(year?: number) {
    const all = await this.prisma.orm.public.Holiday
      .where({} as any)
      .orderBy(m => (m as any).date.asc())
      .all();

    if (!year) return all;
    return all.filter((h: any) => {
      const rawDate = h.date;
      const ms = rawDate?.epochMilliseconds ?? new Date(String(rawDate)).getTime();
      return new Date(ms).getFullYear() === year;
    });
  }

  async createHoliday(dto: CreateHolidayDto) {
    return this.prisma.orm.public.Holiday.create({
      id:          uuidv4(),
      name:        dto.name as any,
      date:        new Date(dto.date) as any,
      description: dto.description ?? null,
      isOptional:  dto.isOptional ?? false,
      companyId:   dto.companyId ?? null,
      createdAt:   now() as any,
      updatedAt:   now() as any,
    } as any);
  }
}
