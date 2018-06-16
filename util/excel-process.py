from sys import stdin, stdout
import json

from openpyxl import Workbook

def main():
    print('START')
    headers = stdin.readline()[:-1].split(',')

    wb = Workbook()
    wb.remove(wb.active)

    line = stdin.readline()[:-1]
    print('ć'.encode())
    print('č'.encode())
    print('ž'.encode())
    print('š'.encode())
    print('đ'.encode())
    while True:
        line = stdin.readline()[:-1]
        if line == '':
            break

        student = json.loads(line)
        if not student['grade'] in wb.sheetnames:
            wb.create_sheet(student['grade'])
            wb[student['grade']].append(headers)
        
        print(str(student['last name']).encode())
        wb[student['grade']].append(list(student.values()))
    
    wb.save('test.xlsx')

    print('Finished')
    stdout.flush()

#start process
if __name__ == '__main__':
    main()