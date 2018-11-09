from sklearn.feature_extraction.text import TfidfVectorizer
from nltk.corpus import stopwords
from nltk import word_tokenize, download
import pandas as pd
import numpy as np
import re
from sklearn.model_selection import train_test_split
from collections import defaultdict
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import json
import pickle
from sklearn.externals import joblib


a = "Я хороший и вы все тоже хорошие"
loaded_model = joblib.load(filename)
result = loaded_model.predict(X_test, Y_test)
print(result)