from sys import argv
from os import path, remove
import csv
import certificates, excel

def parse(filename, dates, signature):
    excel.clear()
    certificates.clear()

    with open(path.join('data', 'student-ids.csv'), 'r', encoding='utf-8') as student_data_file:
        reader = csv.DictReader(student_data_file)

        student_data = {}
        for row in reader:
            student_id = row['id']
            student_data[student_id] = row

    with open(filename, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)

        headers = reader.fieldnames
        headers.append('Class')

        for row in reader:
            try:
                current_student_id = row['SIS ID']
            except NameError:
                current_student_id = row['student_sis_id']

            if current_student_id in student_data:
                current_student = student_data[current_student_id]

                row['Institution'] = current_student['institution']
                row['Class'] = current_student['class']

                # EXCEL
                data = [row[f] for f in headers]
                excel.add_student(row['Institution'], row['Class'], headers, data)
                # CERTIFICATE
                certificates.generate_certificate(row, dates, signature)

    print(1)

if __name__ == '__main__':
    if len(argv) > 1:
        filename = argv[1]
        dates = argv[2]
        signature = argv[3].upper()
    else:
        filename = 'test.csv'
        signature = 'HEAD OF DEPARTMENT'

    parse(filename, dates, signature)
