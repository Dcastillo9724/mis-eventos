from sqlmodel import SQLModel


class PaginatedResponse(SQLModel):
    """Respuesta paginada genérica."""

    total: int
    page: int
    page_size: int
    total_pages: int
    items: list