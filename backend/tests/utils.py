from __future__ import annotations

from copy import deepcopy
from types import SimpleNamespace
from typing import Any, Dict, Iterable, List, Optional

import app.main as app_main


class InMemoryTable:
    """
    Minimal Supabase table stand-in that supports select/insert/update/delete
    with eq/in filters. Enough for exercising business logic in unit tests.
    """

    def __init__(self, rows: Optional[List[Dict[str, Any]]] = None):
        self.rows: List[Dict[str, Any]] = rows or []
        self._operation: Optional[str] = None
        self._filters: List[tuple] = []
        self._payload: Optional[Dict[str, Any]] = None

    # Query builders --------------------------------------------------
    def select(self, *args, **kwargs):
        self._operation = "select"
        return self

    def insert(self, data: Dict[str, Any]):
        self._operation = "insert"
        self._payload = deepcopy(data)
        return self

    def update(self, data: Dict[str, Any]):
        self._operation = "update"
        self._payload = deepcopy(data)
        return self

    def delete(self):
        self._operation = "delete"
        return self

    def eq(self, field: str, value: Any):
        self._filters.append(("eq", field, value))
        return self

    def in_(self, field: str, values: Iterable[Any]):
        self._filters.append(("in", field, set(values)))
        return self

    # For API compatibility; behaves like eq in tests
    def ilike(self, field: str, pattern: str):
        lowered_pattern = pattern.replace("%", "").lower()
        self._filters.append(
            (
                "ilike",
                field,
                lowered_pattern,
            )
        )
        return self

    # Execution -------------------------------------------------------
    def execute(self):
        rows = self._apply_filters()

        try:
            if self._operation == "select":
                data = [deepcopy(row) for row in rows]
            elif self._operation == "insert":
                new_row = self._payload or {}
                self.rows.append(new_row)
                data = [deepcopy(new_row)]
            elif self._operation == "update":
                data = []
                for row in rows:
                    row.update(self._payload or {})
                    data.append(deepcopy(row))
            elif self._operation == "delete":
                remaining = [row for row in self.rows if row not in rows]
                deleted = len(self.rows) - len(remaining)
                self.rows = remaining
                data = [{"deleted": deleted}]
            else:
                data = []
        finally:
            # Reset state so new chains start cleanly
            self._operation = None
            self._filters = []
            self._payload = None

        return SimpleNamespace(data=data)

    # Helpers ---------------------------------------------------------
    def _apply_filters(self) -> List[Dict[str, Any]]:
        filtered = self.rows
        for op, field, value in self._filters:
            if op == "eq":
                filtered = [row for row in filtered if row.get(field) == value]
            elif op == "in":
                filtered = [row for row in filtered if row.get(field) in value]
            elif op == "ilike":
                filtered = [
                    row
                    for row in filtered
                    if value in str(row.get(field, "")).lower()
                ]
        return filtered


class InMemorySupabase:
    """
    Minimal supabase client that returns preconfigured InMemoryTable
    instances by table name.
    """

    def __init__(self, tables: Optional[Dict[str, InMemoryTable]] = None):
        self.tables: Dict[str, InMemoryTable] = tables or {}

    def table(self, name: str) -> InMemoryTable:
        if name not in self.tables:
            self.tables[name] = InMemoryTable()
        return self.tables[name]


def setup_supabase(monkeypatch, tables: Dict[str, InMemoryTable]) -> InMemorySupabase:
    """
    Helper to replace app.main.supabase with an InMemorySupabase instance
    populated with the provided tables.
    """
    supabase = InMemorySupabase(tables)
    monkeypatch.setattr(app_main, "supabase", supabase)
    return supabase


