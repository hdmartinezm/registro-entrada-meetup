#!/usr/bin/env python3
from reportlab.lib.pagesizes import inch
from reportlab.pdfgen import canvas
from datetime import datetime

# Crear PDF de 3x2 pulgadas (216x144 puntos)
width = 3 * inch
height = 2 * inch

pdf_path = "temp/test-badge.pdf"
c = canvas.Canvas(pdf_path, pagesize=(width, height))

# Fondo blanco
c.setFillColorRGB(1, 1, 1)
c.rect(0, 0, width, height, fill=1)

# Texto de prueba
c.setFillColorRGB(0, 0, 0)
c.setFont("Helvetica-Bold", 24)
c.drawCentredString(width/2, height - 30, "PRUEBA")

c.setFont("Helvetica", 14)
c.drawCentredString(width/2, height - 55, "Badge de Prueba")

c.setFont("Helvetica", 10)
c.drawCentredString(width/2, height - 75, datetime.now().strftime("%H:%M:%S"))

# Rectángulo de borde
c.setStrokeColorRGB(0, 0, 0)
c.setLineWidth(2)
c.rect(5, 5, width-10, height-10, fill=0)

c.save()
print(f"PDF creado: {pdf_path}")
