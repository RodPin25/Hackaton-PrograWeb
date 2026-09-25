from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import text
import uuid
from app.api.deps import get_db

router = APIRouter(prefix="/pedidos", tags=["Pedidos y Geolocalización"])

class PedidoItemInput(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float

class CrearPedidoInput(BaseModel):
    destino_id: int
    usuario_id: Optional[int] = 1
    repartidor_id: Optional[int] = 2
    proveedor_id: Optional[int] = 1
    notas_finales: Optional[str] = ""
    latitud_inicial: Optional[float] = None
    longitud_inicial: Optional[float] = None
    items: List[PedidoItemInput]

class ActualizarTrackingInput(BaseModel):
    usuario_id: Optional[int] = 2
    estado: str
    notas: Optional[str] = ""
    latitud: float
    longitud: float
    evidencia_url: Optional[str] = None

@router.get("")
def listar_pedidos(db: Session = Depends(get_db)):
    sql = text("""
        SELECT 
            p.id, 
            p.codigo, 
            p.destino_id, 
            d.nombre_hospital as destino_nombre,
            d.latitud as destino_latitud,
            d.longitud as destino_longitud,
            p.usuario_id, 
            p.repartidor_id, 
            CONCAT(u_rep.nombres, ' ', u_rep.apellidos) as repartidor_nombre,
            p.proveedor_id, 
            prov.nombre as proveedor_nombre,
            p.estado_actual, 
            p.total, 
            p.notas_finales, 
            p.fecha_creacion,
            pt.latitud as ultima_latitud,
            pt.longitud as ultima_longitud,
            pt.fecha_actualizacion as ultima_actualizacion
        FROM pedidos p
        JOIN destinos d ON d.id = p.destino_id
        LEFT JOIN usuarios u_rep ON u_rep.id = p.repartidor_id
        LEFT JOIN proveedores prov ON prov.id = p.proveedor_id
        LEFT JOIN LATERAL (
            SELECT latitud, longitud, fecha_actualizacion
            FROM pedidos_tracking
            WHERE pedido_id = p.id
            ORDER BY fecha_actualizacion DESC, id DESC
            LIMIT 1
        ) pt ON TRUE
        ORDER BY p.id DESC
    """)
    rows = db.execute(sql).mappings().all()
    
    result = []
    for r in rows:
        ped_dict = dict(r)
        sql_items = text("""
            SELECT pi.id, pi.producto_id, prod.nombre as producto_nombre, pi.cantidad, pi.precio_unitario, pi.subtotal
            FROM pedidos_item pi
            JOIN productos prod ON prod.id = pi.producto_id
            WHERE pi.pedido_id = :pedido_id
        """)
        items = db.execute(sql_items, {"pedido_id": r["id"]}).mappings().all()
        ped_dict["items"] = [dict(i) for i in items]
        result.append(ped_dict)
        
    return {"success": True, "data": result}

@router.post("")
def crear_pedido(input_data: CrearPedidoInput, db: Session = Depends(get_db)):
    codigo = f"PED-2026-{str(uuid.uuid4().hex[:6]).upper()}"
    total = sum(item.cantidad * item.precio_unitario for item in input_data.items)
    
    sql_ped = text("""
        INSERT INTO pedidos (codigo, destino_id, usuario_id, repartidor_id, proveedor_id, estado_actual, total, notas_finales)
        VALUES (:codigo, :destino_id, :usuario_id, :repartidor_id, :proveedor_id, 'CREADO', :total, :notas)
        RETURNING id
    """)
    ped_id = db.execute(sql_ped, {
        "codigo": codigo,
        "destino_id": input_data.destino_id,
        "usuario_id": input_data.usuario_id or 1,
        "repartidor_id": input_data.repartidor_id,
        "proveedor_id": input_data.proveedor_id,
        "total": total,
        "notas": input_data.notas_finales
    }).scalar()
    
    for item in input_data.items:
        subtotal = item.cantidad * item.precio_unitario
        sql_item = text("""
            INSERT INTO pedidos_item (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
            VALUES (:pedido_id, :producto_id, :cantidad, :precio_unitario, :subtotal)
        """)
        db.execute(sql_item, {
            "pedido_id": ped_id,
            "producto_id": item.producto_id,
            "cantidad": item.cantidad,
            "precio_unitario": item.precio_unitario,
            "subtotal": subtotal
        })
        
    # Usar latitud/longitud inicial si se envio, sino las del hospital destino
    if input_data.latitud_inicial is not None and input_data.longitud_inicial is not None:
        lat = input_data.latitud_inicial
        lng = input_data.longitud_inicial
    else:
        sql_dest = text("SELECT latitud, longitud FROM destinos WHERE id = :destino_id")
        dest = db.execute(sql_dest, {"destino_id": input_data.destino_id}).mappings().first()
        lat = dest["latitud"] if dest and dest["latitud"] else 14.634915
        lng = dest["longitud"] if dest and dest["longitud"] else -90.506882
    
    sql_track = text("""
        INSERT INTO pedidos_tracking (pedido_id, usuario_id, estado, notas, latitud, longitud)
        VALUES (:pedido_id, :usuario_id, 'CREADO', 'Pedido registrado en sistema con coordenadas iniciales', :lat, :lng)
    """)
    db.execute(sql_track, {
        "pedido_id": ped_id,
        "usuario_id": input_data.usuario_id or 1,
        "lat": lat,
        "lng": lng
    })
    
    db.commit()
    return {"success": True, "message": f"Pedido {codigo} creado exitosamente", "pedido_id": ped_id, "codigo": codigo}

@router.post("/{pedido_id}/tracking")
def actualizar_tracking(pedido_id: int, input_data: ActualizarTrackingInput, db: Session = Depends(get_db)):
    sql_check = text("SELECT id FROM pedidos WHERE id = :id")
    ped = db.execute(sql_check, {"id": pedido_id}).scalar()
    if not ped:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
        
    sql_track = text("""
        INSERT INTO pedidos_tracking (pedido_id, usuario_id, estado, notas, evidencia_url, latitud, longitud)
        VALUES (:pedido_id, :usuario_id, :estado, :notas, :evidencia_url, :latitud, :longitud)
    """)
    db.execute(sql_track, {
        "pedido_id": pedido_id,
        "usuario_id": input_data.usuario_id or 2,
        "estado": input_data.estado,
        "notas": input_data.notas,
        "evidencia_url": input_data.evidencia_url,
        "latitud": input_data.latitud,
        "longitud": input_data.longitud
    })
    
    sql_upd = text("UPDATE pedidos SET estado_actual = :estado WHERE id = :id")
    db.execute(sql_upd, {"estado": input_data.estado, "id": pedido_id})
    
    db.commit()
    return {"success": True, "message": "Geolocalización y estado actualizados correctamente en DB"}

@router.get("/{pedido_id}/tracking")
def obtener_historial_tracking(pedido_id: int, db: Session = Depends(get_db)):
    sql = text("""
        SELECT pt.id, pt.pedido_id, pt.estado, pt.notas, pt.evidencia_url, pt.latitud, pt.longitud, pt.fecha_actualizacion,
               CONCAT(u.nombres, ' ', u.apellidos) as usuario_nombre
        FROM pedidos_tracking pt
        JOIN usuarios u ON u.id = pt.usuario_id
        WHERE pt.pedido_id = :pedido_id
        ORDER BY pt.fecha_actualizacion ASC, pt.id ASC
    """)
    rows = db.execute(sql).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}
