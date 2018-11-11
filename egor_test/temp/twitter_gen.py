import csv
import json
import random
import sentencepiece as np
# 222000

# 'train.json'
# 'test.json'
# 'valid.json'

# 222 * 75 = 16650
# 222 * 20 = 4440
# 222 * 5 = 1110

sp = np.SentencePieceProcessor()
sp.Load("m.model")

def split_str(s):
    return sp.EncodeAsPieces(s)

def csv_reader(outfile):
    """
    Read a csv file
    """
    positive_path = "positive.csv"
    negative_path = "negative.csv"
    
    ans = []

    with open(positive_path, mode='r', encoding='utf-8') as f_obj:
        reader = csv.DictReader(f_obj, delimiter=';')
        for row in reader:
            ans.append(json.dumps({"label": "1", "text": split_str(row["text"])}, ensure_ascii=False))

    with open(negative_path, mode='r', encoding='utf-8') as f_obj:
        reader = csv.DictReader(f_obj, delimiter=';')
        for row in reader:
            ans.append(json.dumps({"label": "0", "text": split_str(row["text"])}, ensure_ascii=False))

    random.shuffle(ans)

    with open('train.json', 'w') as outfile:
        for line in ans[:166500]:
            outfile.write(line + '\n')

    with open('test.json', 'w') as outfile:
        for line in ans[166510:210910]:
            outfile.write(line + '\n')
        #outfile.writelines(ans[16651:21091])

    with open('valid.json', 'w') as outfile:
        for line in ans[210920:222000]:
            outfile.write(line + '\n')

if __name__ == "__main__":
    with open('data.json', 'w') as outfile:
        csv_reader(outfile)