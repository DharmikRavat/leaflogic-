import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pymongo.errors import PyMongoError
from app.core.config import settings
from app.db.session import check_database_connection, create_indexes

logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json",
        docs_url=f"{settings.API_V1_PREFIX}/docs"
    )

    # Set all CORS enabled origins
    if settings.CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    @app.get("/", tags=["Health"])
    def root():
        return {
            "app": settings.APP_NAME,
            "status": "running",
            "docs": f"{settings.API_V1_PREFIX}/docs",
            "health": "/health",
        }

    @app.get("/health", tags=["Health"])
    def health_check():
        return {"status": "ok", "app": settings.APP_NAME}

    @app.get("/ready", tags=["Health"])
    def readiness_check():
        if not check_database_connection():
            raise HTTPException(status_code=503, detail="MongoDB is not reachable")
        return {"status": "ready", "database": "mongodb connected"}

    # Include routers
    from app.api.router import api_router
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    @app.on_event("startup")
    def initialize_database():
        try:
            create_indexes()
        except PyMongoError as error:
            logger.warning("MongoDB is unavailable during startup: %s", error)

    @app.on_event("shutdown")
    def close_database_client():
        from app.db.session import client
        client.close()

    @app.exception_handler(PyMongoError)
    def mongo_error_handler(_, error: PyMongoError):
        logger.error("MongoDB request failed: %s", error)
        return JSONResponse(status_code=503, content={"detail": "MongoDB is unavailable"})

    return app

app = create_app()
