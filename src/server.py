from fastapi import FastAPI, UploadFile, Form
from pydantic import BaseModel
import ollama
import easyocr
import base64
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import Body
from fastapi import File, HTTPException  
from PIL import Image
from typing import Optional
from fastapi.middleware.cors import CORSMiddleware
import torch
import PyPDF2
import re
import av

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],  # Разрешить все методы (GET, POST, etc.)
    allow_headers=["*"],  # Разрешить все заголовки
)
print(torch.version.cuda)  # Выведет версию CUDA, с которой скомпилирован PyTorch
# Определение устройства
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(torch.cuda.is_available())  # Should print True if GPU is available
print(torch.cuda.get_device_name(0))
print(f"Using device: {device}")

# Инициализация EasyOCR и векторизатора
reader = easyocr.Reader(['en', 'ru'])
vectorizer = TfidfVectorizer(min_df=1, stop_words='english', ngram_range=(1, 3))

# База знаний
knowledge_base = []
knowledge_vectors = None
sections = []

def split_into_sections(knowledge_base):
    sections = []
    current_section = {"topic": None, "content": []}
    empty_line_count = 0

    for line in knowledge_base:
        line = line.strip()
        if not line:
            empty_line_count += 1
            if empty_line_count >= 4:
                if current_section["content"]:
                    sections.append(current_section)
                    current_section = {"topic": None, "content": []}
                empty_line_count = 0
        else:
            empty_line_count = 0
            if current_section["topic"] is None:
                current_section["topic"] = line
            else:
                current_section["content"].append(line)

    if current_section["content"]:
        sections.append(current_section)

    return sections

def vectorize_sections(sections):
    section_texts = [
        f"{section['topic']}\n{' '.join(section['content'])}" for section in sections
    ]
    vectors = vectorizer.fit_transform(section_texts)  # Обучаем векторизатор на базе знаний
    return vectors, section_texts


def retrieve_relevant_context_from_sections(query, sections, vectors):
    if vectors is None:  # Если векторизатор не обучен
        raise ValueError("The TF-IDF vectorizer is not fitted yet. Please train it first.")
    
    query_vector = vectorizer.transform([query])  # Преобразуем запрос в вектор
    similarities = cosine_similarity(query_vector, vectors).flatten()
    best_idx = similarities.argmax()

    section = sections[best_idx]
    similarity_score = similarities[best_idx]
    topic = section["topic"]
    content = "\n".join(section["content"])

    context = f"[{similarity_score:.2f}] {topic}\n{content}"
    return context


def search_text_from_image(img_path):
    result = reader.readtext(img_path)
    extracted_text = " ".join([detection[1] for detection in result])
    return extracted_text

import uuid
from fastapi.responses import JSONResponse

# Хранилище результатов
results_store = {}
from fastapi import FastAPI, UploadFile, Form, HTTPException, File
from typing import Optional
import uuid
import base64
import ollama

# Хранилище результатов
results_store = {}

@app.post("/query/")
async def query_ollama(
    text: str = Form(...),
    image: Optional[str] = Form(None)  # Принимаем base64 строку изображения, а не файл
):
    request_id = str(uuid.uuid4())
    text_from_image = ""
    base64_image = image  # Теперь это строка base64

    print(f"Received request with text: {text}")

    # Если изображение передано как base64 строка, нет необходимости в его чтении
    if base64_image:
        print(f"Received image in base64")
        # Здесь можно использовать base64_image напрямую, без дополнительной обработки

    # Формируем полный запрос
    full_query = text.strip()

    # Поиск контекста
    try:
        context = retrieve_relevant_context_from_sections(full_query, sections, knowledge_vectors)
    except Exception as e:
        context = ""
        print(f"Ошибка при поиске контекста: {e}")

    # Системное сообщение
    system_message = (
        "Вы эксперт в информационной безопасности. Используйте предоставленный контекст для ответа."
        if context else "Контекст не найден. Ответьте на основе своих знаний."
    )

    # Сборка сообщений с учётом изображения
    messages = [
        {"role": "system", "content": system_message},
        {"role": "user", "content": full_query},  # Отправляем текст как строку
    ]

    if base64_image:
        messages[-1]["images"] = [base64_image]  # добавляем base64 в поле images последнего user-сообщения

    # Контекст как финальное system-сообщение
    if context:
        messages.append({"role": "system", "content": f"Контекст:\n{context}"})

    # Запрос к модели Ollama
    try:
        response = ollama.chat(model="dima3", messages=messages)
        print("Ответ модели:", response)
        results_store[request_id] = {"response": response['message']['content']}
        return {"request_id": request_id, "status": "processing"}
    except Exception as e:
        print(f"Error with Ollama model: {e}")
        results_store[request_id] = {"error": str(e)}
        raise HTTPException(status_code=500, detail="Ошибка запроса к модели.")






@app.get("/result/{request_id}")
def get_result(request_id: str):
    # Получение результата по request_id
    result = results_store.get(request_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result

# @app.post("/load_knowledge_base/")
# def load_knowledge_base(file_path: str):
#     global knowledge_base, sections, knowledge_vectors

#     if not os.path.exists(file_path):
#         return {"error": "Файл не найден."}

#     # Загрузка базы знаний
#     with open(file_path, "r", encoding="utf-8") as file:
#         knowledge_base = [line.strip() for line in file.readlines()]
#     sections = split_into_sections(knowledge_base)
#     knowledge_vectors, _ = vectorize_sections(sections)

#     return {"message": "База знаний успешно загружена."}

# Загрузка данных из файла
# def add_to_knowledge_from_file(file_path):
    """Загружает данные из файла и возвращает базу знаний в виде списка строк, включая пустые строки."""
    knowledge_base = []

    if file_path.endswith('.pdf'):
        try:
            with open(file_path, 'rb') as pdf_file:
                reader = PyPDF2.PdfReader(pdf_file)
                for page in reader.pages:
                    text = page.extract_text()
                    if text is not None:
                        knowledge_base.extend(text.splitlines())
        except Exception as e:
            print(f"Ошибка при обработке PDF файла: {e}")

    elif file_path.endswith('.txt'):
        try:
            with open(file_path, 'r', encoding='utf-8') as txt_file:
                knowledge_base = txt_file.readlines()
        except Exception as e:
            print(f"Ошибка при обработке TXT файла: {e}")

    else:
        print(f"Неподдерживаемый формат файла: {file_path}")

    return [line if line.strip() else '' for line in knowledge_base]
    
# file_path = 'dita1_7.txt'
# # knowledge_base = add_to_knowledge_from_file(file_path)

# # Шаг 1: Разделение базы знаний на разделы
# sections = split_into_sections(knowledge_base)

# # Шаг 2: Векторизация разделов
# knowledge_vectors, section_texts = vectorize_sections(sections)

# ------------------------------------
#  uvicorn server:app --reload
#  python -m uvicorn server:app --reload

