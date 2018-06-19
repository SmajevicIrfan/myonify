from sys import argv, stdin, stdout
from os import path
import json

import math

''' REPORTLAB deps '''
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfbase import pdfmetrics

from reportlab.graphics import renderPM, renderPDF
from reportlab.platypus import Image

from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib import colors

from svglib.svglib import svg2rlg

pWidth, pHeight = landscape(A4)

''' FONTS '''
source_sans_reg_file = path.join('assets', 'fonts', 'SourceSansPro.ttf')
source_sans_it_file = path.join('assets', 'fonts', 'SourceSansPro-It.ttf')
great_vibes_file = path.join('assets', 'fonts', 'GreatVibes.ttf')

pdfmetrics.registerFont(TTFont("Source Sans Pro", source_sans_reg_file))
pdfmetrics.registerFont(TTFont("Source Sans Pro-It", source_sans_it_file))
pdfmetrics.registerFont(TTFont("GreatVibes", great_vibes_file))

template_file = path.join('assets', 'template.svg')
myON_logo_file = path.join('assets', 'myON_logo.png')
template = svg2rlg(template_file)

def generate_certificate(data, saveLocation, meta):
    full_name = "%s %s" % (data['first name'], data['last name'])

    pages_read = data['pages read']
    lexile = data['lexile']

    hours_read = math.floor(data['minutes read'] / 60)
    minutes_read = math.floor(data['minutes read'] % 60)
    time_read = "%dh %dmin" % (hours_read, minutes_read)

    ''' CANVAS SETUP '''
    outfile = path.join(saveLocation, "%s.pdf" % (full_name))
    c = canvas.Canvas(outfile, pagesize=landscape(A4))
    
    c.setTitle("%s - Certificate of MyON Progress" % (full_name))
    
    # TEMPLATE
    renderPDF.draw(template, c, 0, 0)

    # MYON LOGO
    c.drawImage(myON_logo_file, 120.945, pHeight - 426.84, mask='auto', width=600, height=200.4)

    ''' CERTIFICATE HEADER '''
    #Coordinates: 141.208, Color: #4E4E4E
    c.setFillColor(colors.HexColor('#4E4E4E'))
    c.setFont("Source Sans Pro", 60)
    c.drawCentredString(pWidth / 2, pHeight - 136.208, "CERTIFICATE")

    #Coordinates: 173.017
    c.setFontSize(30)
    c.drawCentredString(pWidth / 2, pHeight - 168.017, "OF PROGRESS")

    # Left Logo
    if (meta['leftLogo'] != '0'):
        leftLogo_file = path.join(saveLocation, 'tmp-logos', meta['leftLogo'])
        c.drawImage(leftLogo_file, 72.57, pHeight - 202, mask='auto', preserveAspectRatio=True, width=106.911, height=137)
    
    # Right Logo
    if (meta['rightLogo'] != '0'):
        rightLogo_file = path.join(saveLocation, 'tmp-logos', meta['rightLogo'])
        c.drawImage(rightLogo_file, 655.57, pHeight - 202, mask='auto', preserveAspectRatio=True, width=106.911, height=137)
    
    ''' DATA '''
    c.setFontSize(20)

    # CURRENT LEXILE
    c.drawCentredString(pWidth / 2, pHeight - 346.309, "Current lexile level – %d" % (lexile))

    # TIME READ
    c.drawCentredString(pWidth / 2, pHeight - 371.309, "Time spent reading – %s" % (time_read))

    # PAGES READ
    c.drawCentredString(pWidth / 2, pHeight - 396.309, "Pages read – %d" % (pages_read))

    ''' FOOTER '''
    c.setFont("Source Sans Pro-It", 16)
    # DATE
    # Coordinates: 262.445, 507.72
    c.drawCentredString(262.445, pHeight - 507.72, "READING PERIOD")
    # Coordinates: 482.72
    c.drawCentredString(262.445, pHeight - 482.72, meta['data_period'])

    #SIGNATURE
    #Coordinates: 578.85, 507.72
    c.drawCentredString(578.85, pHeight - 507.72, meta['signature_title'])
    #Coordinates: 482.72
    c.drawCentredString(578.85, pHeight - 482.72, meta['signature'])

    ''' NAME '''
    # Coordinates: 251.085, Color: #801417
    c.setFont("GreatVibes", 50)
    c.setFillColor(colors.HexColor('#801417'))
    c.drawCentredString(pWidth / 2, pHeight - 232.085, full_name)

    ''' FINISH UP AND SAVE '''
    c.showPage()
    c.save()
    c._filename

def main(saveLocation):
    data_period = stdin.readline()[:-1]
    signature_title = stdin.readline()[:-1]
    signature = stdin.readline()[:-1]

    leftLogo = stdin.readline()[:-1]
    rightLogo = stdin.readline()[:-1]

    meta = {
        'data_period': data_period,
        'signature_title': signature_title,
        'signature': signature,
        'leftLogo': leftLogo,
        'rightLogo': rightLogo
    }

    while True:
        line = stdin.readline()[:-1]
        if line == '':
            break

        student = json.loads(line)
        generate_certificate(student, saveLocation, meta)

    stdout.write('DONE cert_gen')
    stdout.flush()

#start process
if __name__ == '__main__':
    if len(argv) >= 2:
        main(argv[1])
    else:
        stdout.write('ERROR')
        stdout.flush()