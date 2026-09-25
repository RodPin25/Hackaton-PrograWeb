from fastapi import APIRouter
from app.api.endpoints.info import router as info_router
from app.api.endpoints.auth import router as auth_router
from app.api.endpoints.catalogos import router as catalogos_router
from app.api.endpoints.pedidos import router as pedidos_router

router = APIRouter()

router.include_router(info_router)
router.include_router(auth_router)
router.include_router(catalogos_router)
router.include_router(pedidos_router)