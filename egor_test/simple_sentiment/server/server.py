from flask import Flask, logging
from flask import request, make_response, Response, jsonify
from sklearn.externals import joblib
from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.corpus import stopwords
from nltk import word_tokenize, download
import scipy.sparse as sp
import re

download('stopwords')
download('punkt')


def ru_token(string):
    """russian tokenize based on nltk.word_tokenize. only russian letter remaind."""
    return [i for i in word_tokenize(string) if re.match(r'[\u0400-\u04ffа́]+$', i)]

params = {}
params['tokenizer'] = ru_token
params['stop_words'] = stopwords.words('russian')
params['ngram_range'] = (1, 3)
params['min_df'] = 3

idfs = joblib.load("../saved_models/idfs.dat")

class MyVectorizer(TfidfVectorizer):
    # plug our pre-computed IDFs
    TfidfVectorizer.idf_ = idfs


tfidf  = MyVectorizer(**params)
tfidf._tfidf._idf_diag = sp.spdiags(idfs,
                                         diags = 0,
                                         m = len(idfs),
                                         n = len(idfs))
vocabulary = joblib.load("../saved_models/vocab.dat")
tfidf.vocabulary_ = vocabulary
print(tfidf.transform(['hey macarena']))


filename_ng = "../saved_models/finalized_model.sav"


loaded_model = joblib.load(filename_ng)

message_queue = []
print("SERVER NOW IS STARTING")
app = Flask(__name__)

@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/get_score_pos_neg', methods=['POST', 'GET'])
def pos_neg_request():
    if request.method == 'POST':
        try:
            body = request.json
            message = body["message"]
            if len(message) >= 0:
                new_pred = loaded_model.predict_proba(tfidf.transform([message])).squeeze()   
                neg, pos = new_pred[0], new_pred[1]
                return jsonify(neg = neg, pos = pos)
            else:
                app.logger.warning("Some data is empty")                
        except KeyError as err:
            app.logger.warning("Bad post data")
    else:
        app.logger.warning("Someone doing get reqest for prediction, ignoring")
    return Response(status=201)