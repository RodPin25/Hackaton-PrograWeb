from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.api.deps import get_db

router = APIRouter(prefix="/catalogos", tags=["Catálogos"])

@router.get("/destinos")
def get_destinos(db: Session = Depends(get_db)):
    sql = text("""
        SELECT d.id, d.nombre_hospital, d.direccion, d.latitud, d.longitud, m.nombre as municipio
        FROM destinos d
        JOIN municipios m ON m.id = d.municipio_id
        ORDER BY d.id ASC
    """)
    rows = db.execute(sql).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.get("/productos")
def get_productos(db: Session = Depends(get_db)):
    sql = text("SELECT id, nombre, precio FROM productos ORDER BY id ASC")
    rows = db.execute(sql).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.get("/proveedores")
def get_proveedores(db: Session = Depends(get_db)):
    sql = text("SELECT id, nombre, correo, numero, latitud, longitud FROM proveedores ORDER BY id ASC")
    rows = db.execute(sql).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

@router.get("/repartidores")
def get_repartidores(db: Session = Depends(get_db)):
    sql = text("""
        SELECT u.id, u.nombres, u.apellidos, u.correo, r.nombre_rol
        FROM usuarios u
        JOIN roles r ON r.id = u.rol_id
        ORDER BY u.id ASC
    """)
    rows = db.execute(sql).mappings().all()
    return {"success": True, "data": [dict(r) for r in rows]}

