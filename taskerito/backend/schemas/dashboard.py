from pydantic import BaseModel

class DashboardStats(BaseModel):
    total_tasks: int
    tasks_to_do: int
    tasks_in_progress: int
    tasks_done: int
    overdue_tasks_count: int
