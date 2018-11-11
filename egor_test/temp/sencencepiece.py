import sentencepiece as spm
spm.SentencePieceTrainer.Train('--input=train.txt --model_prefix=m --vocab_size=1000')