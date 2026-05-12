    try:
        payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
        request.state.user_id = payload.get("sub")
        request.state.user_role = payload.get("role")
    except jwt.ExpiredSignatureError:
        return JSONResponse(status_code=401, content={"detail": "Token expirado"})
    except jwt.InvalidSignatureError:
        return JSONResponse(status_code=401, content={"detail": "Firma invalida"})
    except Exception as e:
        return JSONResponse(status_code=401, content={"detail": str(e)})

    return await call_next(request)
