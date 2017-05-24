from os import path, listdir, remove
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.platypus import Image
from reportlab.graphics import renderPM

from svglib.svglib import svg2rlg
import math

width, height = landscape(A4)

source_sans_reg_file = path.join(path.join('data', 'fonts'), 'SourceSansPro.ttf')
source_sans_it_file = path.join(path.join('data', 'fonts'), 'SourceSansPro-It.ttf')
great_vibes_file = path.join(path.join('data', 'fonts'), 'GreatVibes.ttf')

template_file = path.join('data', 'template.svg')
myON_logo_file = path.join('data', 'myON_logo.png')
template = svg2rlg(template_file)

pdfmetrics.registerFont(TTFont("Source Sans Pro", source_sans_reg_file))
pdfmetrics.registerFont(TTFont("Source Sans Pro-It", source_sans_it_file))
pdfmetrics.registerFont(TTFont("GreatVibes", great_vibes_file))

def clear():
    directory = path.join(path.join('data', 'download'), 'certificates')
    for filename in listdir(directory):
        if filename.endswith(".pdf"):
            remove(path.join(directory, filename))

def generate_certificate(data, dates, signature):
    full_name = data['Last Name'] + ' ' + data['First Name']

    pages_read = data['Pages Read (BF)']
    words_read = data['Words Read (BF)']

    hours_read = float(data['Time Spent Reading (Hours)'])
    full_hours = math.floor(hours_read)
    full_minutes = math.floor(60 * (hours_read - full_hours))
    time_read = str(full_hours) + ' h ' + str(full_minutes)

    earliest_lexile = data['Earliest Lexile']
    latest_lexile = data['Latest Lexile']

    lexile_progress = data['Lexile Progress']
    if lexile_progress == '':
        lexile_progress = '0'
    elif float(lexile_progress) > 0:
        lexile_progress = '+' + lexile_progress

    #PDF Generation
    outfile = path.join(path.join(path.join('data', 'download'), 'certificates'), full_name + '.pdf')
    c = canvas.Canvas(outfile, pagesize=landscape(A4))

    #TEMPLATE
    #template.drawOn(c, 0, 0)
    template.drawOn(c, -13.43, height - 608.77)

    #MyON LOGO
    #Coordinates: 121.935, 414.48
    c.drawImage(myON_logo_file, 121.935, height - 414.48, mask='auto', width=600.02, height=200.11)

    #CERTIFICATE HEADER
    #Coordinates: 151.208, Color: #4E4E4E
    c.setFillColor(colors.HexColor('#4E4E4E'))
    c.setFont("Source Sans Pro", 60)
    c.drawCentredString(width / 2, height - 151.208 + 25, "CERTIFICATE")

    #Coordinates: 183.017
    c.setFont("Source Sans Pro", 30)
    c.drawCentredString(width / 2, height - 183.017 + 13, "OF PROGRESS")

    '''DATA'''
    c.setFont("Source Sans Pro", 24)
    #WORDS READ
    #Coordinates: 131, 345.789
    c.drawString(131, height - 345.789 + 10, "Words read – " + words_read)

    #PAGES READ
    #Coordinates: 131, 376.309
    c.drawString(131, height - 376.309 + 10, "Pages read – " + pages_read)

    #TIME READ
    #Coordinates: 131, 406.827
    c.drawString(131, height - 406.827 + 10, "Time spent reading – " + time_read)

    #EARLIEST LEXILE
    #Coordinates: 480.269, 345.789
    c.drawString(480.269, height - 345.789 + 10, "Earliest lexile level – " + earliest_lexile)

    #LATEST LEXILE
    #Coordinates: 480.269, 376.309
    c.drawString(480.269, height - 376.309 + 10, "Latest lexile level – " + latest_lexile)

    #LEXILE PROGRESS
    #Coordinates: 480.269, 406.827
    c.drawString(480.269, height - 406.827 + 10, "Lexile progress – " + lexile_progress)

    '''FOOTER'''
    c.setFont("Source Sans Pro-It", 20)
    #DATE
    #Coordinates: 262.445, 507.72
    c.drawCentredString(262.445, height - 507.72, "DATE")
    #Coordinates: 482.72
    c.drawCentredString(262.445, height - 482.72, dates)

    #SIGNATURE
    #Coordinates: 578.85, 507.72
    c.drawCentredString(578.85, height - 507.72, signature)

    '''NAME'''
    #Coordinates: 251.085, Color: #801417
    c.setFont("GreatVibes", 50)
    c.setFillColor(colors.HexColor('#801417'))
    c.drawCentredString(width / 2, height - 235.085, full_name)

    c.showPage()
    c.save()
