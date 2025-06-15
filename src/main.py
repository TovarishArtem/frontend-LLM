from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware  # ✅ Импортируем CORSMiddleware
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from pydantic import BaseModel


app = FastAPI()

# Добавляем middleware для CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Разрешаем только этот источник
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все HTTP методы (GET, POST и т.д.)
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Фейковая база данных
fake_db = {}

# Настройки JWT
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Pydantic-модель для регистрации
class UserCreate(BaseModel):
    username: str
    password: str

# Хеширование пароля
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Токен-авторизация
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict, expires_delta: timedelta):
    """Создает JWT-токен"""
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/register")
async def register(user: UserCreate):
    """Регистрирует пользователя"""
    print(f"📥 Получены данные пользователя: {user}")  # Логируем данные, которые приходят
    if user.username in fake_db:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")

    hashed_password = pwd_context.hash(user.password)
    fake_db[user.username] = hashed_password
    print(f"Пользователь зарегистрирован: {user.username}")  # Логируем успешную регистрацию

    return {"message": "Пользователь зарегистрирован"}


@app.post("/token")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Вход и выдача токена"""
    user = fake_db.get(form_data.username)
    if not user or not pwd_context.verify(form_data.password, user):
        raise HTTPException(status_code=400, detail="Неверные данные")
    
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/protected")
def protected_route(token: str = Depends(oauth2_scheme)):
    """Защищенный маршрут"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username not in fake_db:
            raise HTTPException(status_code=401, detail="Недействительный токен")
    except JWTError:
        raise HTTPException(status_code=401, detail="Недействительный токен")
    return {"message": "Доступ разрешен", "user": username}
