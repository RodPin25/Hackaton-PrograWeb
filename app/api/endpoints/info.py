from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas.info import MunicipioRequestSchema, MunicipioResponseSchema
from app.services.info import InfoService
from app.api.deps import get_db

router = APIRouter(tags=["Información"])

@router.post("/municipios", response_model=MunicipioResponseSchema)
def get_municipios(
    req: MunicipioRequestSchema = MunicipioRequestSchema(),
    db: Session = Depends(get_db)
):
    """
    Endpoint POST único para municipios. Recibe todo por el Body (Payload) usando MunicipioRequestSchema:
    - Body: `{}` o `{"municipio_id": null}` -> Retorna todos los municipios.
    - Body: `{"municipio_id": 1}` -> Retorna el municipio filtrado por ID.
    """
    return InfoService.get_municipios(db=db, req=req)
