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
    slots = []
    step = timedelta(minutes=step_min)
    dur = timedelta(minutes=duration_min)
    for start, end in intervals:
        cur = datetime.combine(parse_date("2000-01-01"), start)
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

    base = get_daily_working_intervals(date_obj)

    apps = Appointment.objects.filter(technician=technician, date=date_obj).values("start_time", "end_time")
    busy = [(a["start_time"], a["end_time"]) for a in apps]

    if busy:
        base = _subtract_intervals(base, busy)

    return base

    # # 全店营业时间（已扣 holiday + breaks）
    # store_open = get_daily_working_intervals(date_obj)
    # if not store_open:
    #     return []

    # # 技师上班时间（单独配置）
    # tech_work = get_technician_working_intervals(technician, date_obj)
    # if not tech_work:
    #     return []

    # # 交集 = 当天这个技师理论可上班时间
    # base = _intersect_intervals(store_open, tech_work)
    # if not base:
    #     return []

    # # 扣掉已有预约
    # apps = Appointment.objects.filter(technician=technician, date=date_obj).values("start_time", "end_time")
    # busy = [(a["start_time"], a["end_time"]) for a in apps]
    # if busy:
    #     base = _subtract_intervals(base, busy)

    # return base



def compute_available_slots(date_obj, service: Service, technician: Optional[Technician] = None, step_min: int = 15):
    """
    返回可预约的开始时间列表（time objects）
    - step_min=30: 半小时一个 slot
    - 默认所有 active 技师都能做所有 services
    """
    duration_raw = (
        getattr(service, "duration_min", None)
        or getattr(service, "duration", None)
        or getattr(service, "duration_minutes", None)
        or getattr(service, "minutes", None)
        or 30
    )


    try:
        duration_min = int(duration_raw)
    except (TypeError, ValueError):
        duration_min = 30

    if duration_min <= 0:
        duration_min = 30

    if technician:
        if not getattr(technician, "active", True):
            return []
        free = get_technician_free_intervals(technician, date_obj)
        return _generate_slots(free, duration_min, step_min)

    slots_union = set()
    for tech in Technician.objects.filter(active=True):
        free = get_technician_free_intervals(tech, date_obj)
        for t in _generate_slots(free, duration_min, step_min):
            slots_union.add(t)

    return sorted(list(slots_union))


def is_slot_available(date_obj, start_time, end_time, service: Service, technician: Optional[Technician]):
    if technician:
        conflict = Appointment.objects.filter(
            technician=technician,
            date=date_obj,
        ).filter(
            Q(start_time__lt=end_time) & Q(end_time__gt=start_time)
        ).exists()
        if conflict:
            return False

        free = get_technician_free_intervals(technician, date_obj)
        for s, e in free:
            if s <= start_time and end_time <= e:
                return True
        return False

    # ✅ 默认所有 active tech 都能做
    for tech in Technician.objects.filter(active=True):
        if is_slot_available(date_obj, start_time, end_time, service, technician=tech):
            return True
    return False


def get_technician_working_intervals(technician: Technician, date_obj) -> List[tuple]:
    """
    返回技师当天上班的时间段（不含全店break/holiday过滤；那在全店层做）
    """
    weekly = getattr(technician, "weekly_hours", None) or {}
    day_key = _get_day_key(date_obj)
    return _parse_intervals(weekly.get(day_key, []))

def _intersect_intervals(a: List[tuple], b: List[tuple]) -> List[tuple]:
    result = []
    for a_start, a_end in a:
        for b_start, b_end in b:
            start = max(a_start, b_start)
            end = min(a_end, b_end)
            if start < end:
                result.append((start, end))
    return result
