import openpyxl
import csv

book = openpyxl.load_workbook('doc_comment_summary.xlsx')

sheet = book.active

cells = sheet['A1': 'B26870']

with open('test_data.csv', mode='w') as data_file:
    data_writer = csv.writer(data_file, delimiter=',', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    
    for c1, c2 in cells:
        if(c2.value is None or c1.value is None or isinstance(c2.value, str)):
            print(c1.value)
            continue
        
        if(c2.value < 0):
            data_writer.writerow(['0', c1.value])

        if(c2.value > 0):
            data_writer.writerow(['1', c1.value])
    