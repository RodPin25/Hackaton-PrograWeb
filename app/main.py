from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

app = FastAPI(title="Hackaton PrograWeb API")

# --- SCHEMAS ---

class TrackingBase(BaseModel):
    latitud: float
    longitud: float
    temperatura: Optional[float] = None  # ✅ Nuevo campo
    estado: str

class TrackingCreate(TrackingBase):
    pass

class TrackingResponse(TrackingBase):
    id: int
    pedido_id: int
    fecha_registro: datetime

    class Config:
        orm_mode = True

class PedidoBase(BaseModel):
    cliente_id: int
    direccion_entrega: str
    fecha_entrega_estimada: Optional[datetime] = None  # ✅ Nuevo campo

class PedidoCreate(PedidoBase):
    pass

class PedidoResponse(PedidoBase):
    id: int
    estado: str
    fecha_creacion: datetime
    fecha_entrega_estimada: Optional[datetime] = None

    class Config:
        orm_mode = True

# --- ENDPOINTS ---

@app.get("/pedidos", response_model=List[PedidoResponse])
def listar_pedidos(db: Session = Depends()):
    sql = text("""
        SELECT id, cliente_id, direccion_entrega, estado, fecha_creacion, fecha_entrega_estimada
        FROM pedidos
    """)
    result = db.execute(sql).fetchall()
    return result

@app.get("/pedidos/{pedido_id}/tracking", response_model=List[TrackingResponse])
def obtener_historial_tracking(pedido_id: int, db: Session = Depends()):
    sql = text("""
        SELECT id, pedido_id, latitud, longitud, temperatura, estado, fecha_registro
        FROM pedidos_tracking
        WHERE pedido_id = :pedido_id
        ORDER BY fecha_registro ASC
    """)
    # ✅ Corrección urgente: se le pasa el parámetro {"pedido_id": pedido_id}
    result = db.execute(sql, {"pedido_id": pedido_id}).fetchall()
    return result

@app.post("/pedidos", response_model=PedidoResponse)
def crear_pedido(pedido: PedidoCreate, db: Session = Depends()):
    sql = text("""
        INSERT INTO pedidos (cliente_id, direccion_entrega, fecha_entrega_estimada, estado, fecha_creacion)
        VALUES (:cliente_id, :direccion_entrega, :fecha_entrega_estimada, 'CREADO', NOW())
        RETURNING id, cliente_id, direccion_entrega, fecha_entrega_estimada, estado, fecha_creacion
    """)
    nuevo_pedido = db.execute(sql, {
        "cliente_id": pedido.cliente_id,
        "direccion_entrega": pedido.direccion_entrega,
        "fecha_entrega_estimada": pedido.fecha_entrega_estimada
    }).fetchone()
    db.commit()
    return nuevo_pedido

@app.post("/pedidos/{pedido_id}/tracking", response_model=TrackingResponse)
def registrar_tracking(pedido_id: int, tracking: TrackingCreate, db: Session = Depends()):
    sql = text("""
        INSERT INTO pedidos_tracking (pedido_id, latitud, longitud, temperatura, estado, fecha_registro)
        VALUES (:pedido_id, :latitud, :longitud, :temperatura, :estado, NOW())
        RETURNING id, pedido_id, latitud, longitud, temperatura, estado, fecha_registro
    """)
    nuevo_tracking = db.execute(sql, {
        "pedido_id": pedido_id,
        "latitud": tracking.latitud,
        "longitud": tracking.longitud,
        "temperatura": tracking.temperatura,  # ✅ Guardado igual que lat/long
        "estado": tracking.estado
    }).fetchone()

    db.execute(
        text("UPDATE pedidos SET estado = :estado WHERE id = :pedido_id"),
        {"estado": tracking.estado, "pedido_id": pedido_id}
    )
    db.commit()
    return nuevo_tracking