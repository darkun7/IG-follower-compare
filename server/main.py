from contextlib import asynccontextmanager
from fastapi import FastAPI, Form, File, UploadFile
from fastapi.responses import JSONResponse

from .utils import compare_lists


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="IG Compare API",
    version="1.0.0",
    lifespan=lifespan
)


@app.post("/api/compare")
async def compare_endpoint(
    followers_content: str = "",
    following_content: str = "",
    followerFileType: str = Form("auto"),
    followingFileType: str = Form("auto"),
):
    if not followers_content or not following_content:
        return JSONResponse(
            status_code=400,
            content={"error": "Both followers and following content are required"}
        )
    try:
        result = compare_lists({
            "followers": followers_content,
            "following": following_content,
            "followerFileType": followerFileType,
            "followingFileType": followingFileType,
        })
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


@app.post("/api/compare-files")
async def compare_files_endpoint(
    followers: UploadFile = File(...),
    following: UploadFile = File(...),
    followerFileType: str = Form("auto"),
    followingFileType: str = Form("auto"),
):
    try:
        followers_bytes = await followers.read()
        following_bytes = await following.read()

        followers_text = followers_bytes.decode("utf-8-sig").strip()
        following_text = following_bytes.decode("utf-8-sig").strip()

        if not followers_text or not following_text:
            return JSONResponse(
                status_code=400,
                content={"error": "Both followers and following files must contain data"}
            )

        result = compare_lists({
            "followers": followers_text,
            "following": following_text,
            "followerFileType": followerFileType,
            "followingFileType": followingFileType,
        })
        return JSONResponse(content=result)
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})


@app.get("/health")
def health_check():
    return {"status": "ok"}
