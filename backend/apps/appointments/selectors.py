from datetime import datetime, time, timedelta
from typing import List, Optional
from django.db.models import Q
from django.utils.dateparse import parse_date
from apps.services.models import Service
from apps.technicians.models import Technician
from apps.schedule.models import ScheduleConfigModel
from .models import Appointment

WEEKDAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]


def _parse_intervals(intervals):
    parsed = []
    for iv in intervals or []:
        parsed.append((datetime.strptime(iv["start"], "%H:%M").time(), datetime.strptime(iv["end"], "%H:%M").time()))
    return parsed


def _subtract_intervals(base: List[tuple], to_subtract: List[tuple]) -> List[tuple]:
    """Subtract time intervals (all in same day). base and to_subtract are lists of (start,end) times."""
    result = []
    for b_start, b_end in base:
        current = [(b_start, b_end)]
        for s_start, s_end in to_subtract:
            new_current = []
            for c_start, c_end in current:
                # no overlap
                if s_end <= c_start or s_start >= c_end:
                    new_current.append((c_start, c_end))
                else:
                    # split
                    if c_start < s_start:
                        new_current.append((c_start, max(c_start, s_start)))
                    if s_end < c_end:
                        new_current.append((max(s_end, c_start), c_end))
            current = [(a, b) for a, b in new_current if a < b]
        result.extend(current)
    return [(a, b) for a, b in result if a < b]


def _generate_slots(intervals: List[tuple], duration_min: int, step_min: int = 15) -> List[time]:
    if step_min <= 0:
        raise ValueError("Slot interval must be positive.")
    slots = []
    step = timedelta(minutes=step_min)
    dur = timedelta(minutes=duration_min)
    for start, end in intervals:
        cur = datetime.combine(parse_date("2000-01-01"), start)
        # Round up from midnight, not from the end of the previous booking.
        midnight = cur.replace(hour=0, minute=0, second=0, microsecond=0)
        elapsed = cur - midnight
        quotient, remainder = divmod(elapsed, step)
        cur = midnight + (quotient + bool(remainder)) * step
        end_dt = datetime.combine(parse_date("2000-01-01"), end)
        while cur + dur <= end_dt:
            slots.append(cur.time())
            cur += step
    return slots


def _get_day_key(d):
    return WEEKDAYS[d.weekday()]


def get_daily_working_intervals(date_obj) -> List[tuple]:
    cfg = ScheduleConfigModel.objects.first()
    if not cfg:
        return []
    if date_obj.isoformat() in (cfg.holidays or []):
        return []
    day_key = _get_day_key(date_obj)
    opening = _parse_intervals((cfg.opening_hours or {}).get(day_key, []))


    breaks = _parse_intervals((cfg.breaks or {}).get(day_key, []))
    if breaks:
        opening = _subtract_intervals(opening, breaks)
    return opening


def get_technician_free_intervals(technician: Technician, date_obj) -> List[tuple]:

    if not technician.active:
        return []
    base = get_technician_working_intervals(technician, date_obj)

    apps = Appointment.objects.filter(technician=technician, date=date_obj).exclude(status="cancelled").values("start_time", "end_time")
    busy = [(a["start_time"], a["end_time"]) for a in apps]

    if busy:
        base = _subtract_intervals(base, busy)

    return base




def compute_available_slots(date_obj, service: Service, technician: Optional[Technician] = None, step_min: int = 15):
    """
    返回可预约的开始时间列表（time objects）
    - step_min=30: 半小时一个 slot
    - 默认所有 active 技师都能做所有 services
    """
    services = [service] if isinstance(service, Service) else list(service)
    duration_min = sum(item.duration for item in services)
    if not services or any(item.duration <= 0 for item in services):
        return []

    availability = DayAvailability(date_obj)
    service_ids = {s.pk for s in services}
    starts = set()
    for tech in availability.technicians:
        if technician is not None and technician.pk != tech.pk:
            continue
        if not service_ids.issubset(availability.skills[tech.pk]):
            continue
        starts.update(_generate_slots(availability.free[tech.pk], duration_min, step_min))
    return [start for start in sorted(starts) if availability.can_fit(
        start, (datetime.combine(date_obj, start) + timedelta(minutes=duration_min)).time(),
        service_ids, technician.pk if technician else None)]


def is_slot_available(date_obj, start_time, end_time, service, technician, exclude_id=None):
    services = [service] if isinstance(service, Service) else list(service)
    return DayAvailability(date_obj, exclude_id).can_fit(
        start_time, end_time, {s.pk for s in services}, technician.pk if technician else None)


class DayAvailability:
    """Check staff capacity without assigning unallocated appointments in the database."""

    def __init__(self, date_obj, exclude_id=None):
        self.technicians = list(Technician.objects.filter(active=True).prefetch_related('services'))
        self.skills = {t.pk: {s.pk for s in t.services.all()} for t in self.technicians}
        appointments = list(Appointment.objects.filter(date=date_obj).exclude(
            status='cancelled').exclude(pk=exclude_id).prefetch_related('services'))
        self.free = {}
        for tech in self.technicians:
            busy = [(a.start_time, a.end_time) for a in appointments if a.technician_id == tech.pk]
            self.free[tech.pk] = _subtract_intervals(get_technician_working_intervals(tech, date_obj), busy)
        self.unassigned = [(a.start_time, a.end_time, {s.pk for s in a.services.all()})
                           for a in appointments if a.technician_id is None]

    @staticmethod
    def overlaps(a, b):
        return a[0] < b[1] and b[0] < a[1]

    def candidates(self, start, end, service_ids):
        if not service_ids or start >= end:
            return []
        return [t.pk for t in self.technicians
                if service_ids.issubset(self.skills[t.pk])
                and any(s <= start and end <= e for s, e in self.free[t.pk])]

    def can_fit(self, start, end, service_ids, technician_id=None):
        choices = self.candidates(start, end, service_ids)
        if technician_id is not None:
            choices = [t for t in choices if t == technician_id]
        if not choices:
            return False
        jobs = [(start, end, choices)]
        # Include every connected unassigned reservation, including overlap chains.
        remaining = list(self.unassigned)
        while True:
            connected = [job for job in remaining if any(self.overlaps(job, j) for j in jobs)]
            if not connected:
                break
            for job in connected:
                remaining.remove(job)
                options = self.candidates(*job)
                if not options:
                    return False
                jobs.append((job[0], job[1], options))
        jobs.sort(key=lambda j: len(j[2]))
        planned = {t.pk: [] for t in self.technicians}

        def feasible(index):
            if index == len(jobs):
                return True
            job = jobs[index]
            for tech_id in job[2]:
                if any(self.overlaps(job, busy) for busy in planned[tech_id]):
                    continue
                planned[tech_id].append(job)
                if feasible(index + 1):
                    return True
                planned[tech_id].pop()
            return False

        return feasible(0)


def get_technician_working_intervals(technician: Technician, date_obj) -> List[tuple]:
    """
    返回技师当天上班的时间段（不含全店break/holiday过滤；那在全店层做）
    """
    if not technician.active or _get_day_key(date_obj) not in (technician.working_days or []):
        return []
    return get_daily_working_intervals(date_obj)


def _intersect_intervals(a: List[tuple], b: List[tuple]) -> List[tuple]:
    result = []
    for a_start, a_end in a:
        for b_start, b_end in b:
            start = max(a_start, b_start)
            end = min(a_end, b_end)
            if start < end:
                result.append((start, end))
    return result
