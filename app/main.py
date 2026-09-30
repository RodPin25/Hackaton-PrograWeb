from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="API Tracking de Pedidos Hospitalarios")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configuración de CORS total para ngrok y peticiones externas
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.router import router as api_router

# Registrar con /api y también sin /api para evitar errores 404 de ngrok
app.include_router(api_router, prefix="/api")
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "API Tracking de Pedidos activa"}
