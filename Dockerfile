FROM python:2
ENV PYTHONUNBUFFERED=1
WORKDIR /mysite/
COPY requirements.pip /mysite/
RUN apt-get install libjpeg62-turbo-dev libtiff-dev
RUN pip install -r requirements.pip
WORKDIR /mysite/sh