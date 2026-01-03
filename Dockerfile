FROM node:20-slim AS node-base

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm ci

COPY frontend/ .
ENV NEXT_PUBLIC_API_URL=http://localhost:8000
RUN npm run build

WORKDIR /app

COPY backend/requirements.txt ./backend/
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/

COPY start.sh ./
RUN chmod +x start.sh

ENV PORT=7860
ENV HF_HOME=/tmp/.huggingface

EXPOSE 7860

CMD ["./start.sh"]

