from pydantic import BaseModel, Field
from typing import List, Optional

class MunicipioRequestSchema(BaseModel):
    municipio_id: Optional[int] = Field(None, description="ID opcional del municipio en el body/payload para filtrar")

class MunicipioSchema(BaseModel):
    id: int = Field(..., description="ID único del municipio")
    nombre: str = Field(..., description="Nombre del municipio")
    departamento_id: int = Field(..., description="ID del departamento al que pertenece")

class MunicipioResponseSchema(BaseModel):
    success: bool = Field(True, description="Estado de la respuesta")
    message: str = Field(..., description="Mensaje descriptivo")
    data: List[MunicipioSchema] = Field(default_factory=list, description="Lista de municipios devueltos")

class ProveedorRequestSchema(BaseModel):
    proveedor_id: Optional[int] = Field(None, description="ID opcional del proveedor en el body/payload o query para filtrar")

class ProveedorSchema(BaseModel):
    id: int = Field(..., description="ID único del proveedor")
    nombre: str = Field(..., description="Nombre del proveedor")
    correo: Optional[str] = Field(None, description="Correo electrónico del proveedor")
    numero: Optional[str] = Field(None, description="Número de teléfono de contacto")
    latitud: Optional[float] = Field(None, description="Latitud de la ubicación del proveedor")
    longitud: Optional[float] = Field(None, description="Longitud de la ubicación del proveedor")

class ProveedorResponseSchema(BaseModel):
    success: bool = Field(True, description="Estado de la respuesta")
    message: str = Field(..., description="Mensaje descriptivo")
    data: List[ProveedorSchema] = Field(default_factory=list, description="Lista de proveedores devueltos")

