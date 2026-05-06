FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        curl \
        espeak-ng \
        ffmpeg \
        git \
        libsndfile1 \
        unzip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /opt
RUN git clone --depth 1 https://github.com/myshell-ai/OpenVoice.git /opt/OpenVoice \
    && python -m pip install --upgrade pip setuptools wheel \
    && python -m pip install -e /opt/OpenVoice \
    && python -m pip install git+https://github.com/myshell-ai/MeloTTS.git

RUN python -m unidic download || true

WORKDIR /service
COPY requirements.txt ./requirements.txt
RUN python -m pip install -r requirements.txt

COPY app ./app

EXPOSE 8088

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8088"]
