from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.schemas.info import MunicipioRequestSchema, MunicipioSchema, MunicipioResponseSchema

class InfoService:
    @staticmethod
    def get_municipios(db: Session, req: MunicipioRequestSchema) -> MunicipioResponseSchema:
        if req.municipio_id is not None:
            sql = text("SELECT id, nombre, departamento_id FROM municipios WHERE id = :municipio_id ORDER BY id ASC")
            result = db.execute(sql, {"municipio_id": req.municipio_id}).mappings().all()
            
            if not result:
                return MunicipioResponseSchema(
                    success=False,
                    message=f"No se encontró el municipio con ID {req.municipio_id}",
                    data=[]
                )
            
            municipios = [
                MunicipioSchema(
                    id=row["id"],
                    nombre=row["nombre"],
                    departamento_id=row["departamento_id"]
                ) for row in result
            ]
            return MunicipioResponseSchema(
                success=True,
                message=f"Municipio con ID {req.municipio_id} obtenido exitosamente",
                data=municipios
            )

        sql = text("SELECT id, nombre, departamento_id FROM municipios ORDER BY id ASC")
        result = db.execute(sql).mappings().all()
        
        municipios = [
            MunicipioSchema(
                id=row["id"],
                nombre=row["nombre"],
                departamento_id=row["departamento_id"]
            ) for row in result
        ]
        
        return MunicipioResponseSchema(
            success=True,
            message="Lista de municipios obtenida exitosamente",
            data=municipios
        )
